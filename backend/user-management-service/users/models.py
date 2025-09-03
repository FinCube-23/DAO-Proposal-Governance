from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField


class UserManager(BaseUserManager):
    def create_user(self, email, contact_number, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not contact_number:
            raise ValueError("Users must have a contact number")

        # ensure the whole create_user flow is atomic
        with transaction.atomic():
            user = self.model(
                email=self.normalize_email(email),
                contact_number=contact_number,
                **extra_fields,
            )
            user.set_password(password)
            user.save(using=self._db)
            return user

    def create_superuser(self, email, contact_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_verified_email", True)
        extra_fields.setdefault("is_verified_contact_number", True)
        extra_fields.setdefault("status", "approved")

        # Set first_name and last_name for superuser
        extra_fields.setdefault("first_name", "Admin")
        extra_fields.setdefault("last_name", "User")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # keep superuser creation atomic as well
        with transaction.atomic():
            return self.create_user(
                email=email,
                contact_number=contact_number,
                password=password,
                **extra_fields,
            )


class User(AbstractUser):
    username = None  # Removing Username Field
    email = models.EmailField(unique=True, verbose_name="email address")

    # Using first_name and last_name from AbstractUser
    # Custom fields from your schema
    is_verified_email = models.BooleanField(default=False)
    contact_number = PhoneNumberField(
        unique=True,
        region="US",
        verbose_name="Phone Number",
    )
    is_verified_contact_number = models.BooleanField(default=False)
    wallet_address = models.CharField(
        max_length=255, unique=True, null=True, blank=True
    )

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("banned", "Banned"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    approved_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_users",
    )

    # UTC Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    # Set email as the USERNAME_FIELD
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["contact_number"]

    objects = UserManager()

    def _link_to_default_organization(self):
        """Handles the default organization linking"""
        from organizations.models import Organization, OrganizationUser

        org, created = Organization.objects.get_or_create(
            name="Brain Station 23",
            defaults={
                "email": "sales@brainstation-23.com",
                "type": "plc",
                "address": "Dhaka, Bangladesh",
                "is_active": True,
                "status": "approved",
                "legal_entity_identifier": "TIN 649010914667",
                "organization_admin": self if self.is_superuser else None,
            },
        )

        if created and not org.organization_admin and self.is_superuser:
            org.organization_admin = self
            org.save()

        OrganizationUser.objects.get_or_create(user=self, organization=org)

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def save(self, *args, **kwargs):
        # wrap the whole save+organization-link in a single atomic transaction
        with transaction.atomic():
            is_new = not self.pk

            # Handle timestamps
            self.updated_at = timezone.now()

            # Save user first to get an ID
            super().save(*args, **kwargs)

            # Link to default organization if new user
            if is_new:
                self._link_to_default_organization()

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return f"{full_name} ({self.email})" if full_name else self.email
