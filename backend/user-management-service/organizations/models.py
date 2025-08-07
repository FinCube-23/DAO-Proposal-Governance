# organizations/models.py
from django.db import models
from django.utils import timezone
from users.models import User  # Import your custom User model

class Organization(models.Model):
    ORGANIZATION_TYPES = [
        ('plc', 'PLC'),
        ('llc', 'LLC'),
        ('inc', 'INC'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
        ('banned', 'Banned'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    type = models.CharField(max_length=50, choices=ORGANIZATION_TYPES)
    address = models.TextField()
    is_active = models.BooleanField(default=False)
    legal_entity_identifier = models.CharField(
        verbose_name='LEI (ISO 17442)',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    organization_admin = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='admin_of_organizations'
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class OrganizationUser(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='organization_memberships'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='members'
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        db_table = 'organizations_users'
        unique_together = ('user', 'organization')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} in {self.organization.name}"

class OnchainVerification(models.Model):
    ONCHAIN_STATUS_CHOICES = [
        ('register', 'Register'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
    ]
    
    trx_hash = models.CharField(max_length=66, unique=True, blank=True, null=True)
    onchain_id = models.IntegerField(blank=True, null=True)
    onchain_status = models.CharField(
        max_length=20,
        choices=ONCHAIN_STATUS_CHOICES,
        default='register'
    )
    context = models.JSONField()
    proposer_wallet = models.CharField(max_length=42)  # Assuming Ethereum address length
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='onchain_verifications'
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onchain_verifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Verification {self.id} for {self.organization.name}"