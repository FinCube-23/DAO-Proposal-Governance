from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField 

class User(AbstractUser):
    # Remove default username field and make email the primary identifier
    username = None
    email = models.EmailField(unique=True, verbose_name='email address')
    
    # Custom fields from your schema
    name = models.CharField(max_length=255)
    is_verified_email = models.BooleanField(default=False)
    contact_number = PhoneNumberField(
        unique=True, 
        region='US',  # Set default region (optional)
        verbose_name='Phone Number'
    )
    is_verified_contact_number = models.BooleanField(default=False)
    wallet_address = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('banned', 'Banned'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users'
    )
    
    # UTC Timestamps
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    # Set email as the USERNAME_FIELD
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Removes email from REQUIRED_FIELDS

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Ensure created_at is only set once and updated_at is always updated"""
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email})"