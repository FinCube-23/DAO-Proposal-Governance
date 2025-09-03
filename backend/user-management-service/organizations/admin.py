# organizations/admin.py
from django.contrib import admin
from .models import Organization, OrganizationUser, OnchainVerification

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'email', 
        'type', 
        'status', 
        'is_active',
        'organization_admin',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'type', 
        'is_active',
        'created_at'
    ]
    
    search_fields = [
        'name', 
        'email', 
        'organization_admin__email',
        'organization_admin__first_name',
        'organization_admin__last_name'
    ]
    
    # Allow editing these fields in admin
    fields = [
        'name',
        'email', 
        'type',
        'address',
        'legal_entity_identifier',
        'status',  # This allows status changes
        'organization_admin'
    ]
    
    # Make some fields read-only if needed
    readonly_fields = ['created_at', 'updated_at']
    
    # Add actions for bulk status changes
    actions = ['approve_organizations', 'cancel_organizations', 'ban_organizations', 'set_pending_status']
    
    def approve_organizations(self, request, queryset):
        updated = queryset.update(status='approved', is_active=True)
        self.message_user(
            request, 
            f'{updated} organizations were successfully approved and activated.'
        )
    approve_organizations.short_description = "Approve selected organizations"
    
    def cancel_organizations(self, request, queryset):
        updated = queryset.update(status='cancelled', is_active=False)
        self.message_user(
            request, 
            f'{updated} organizations were cancelled and deactivated.'
        )
    cancel_organizations.short_description = "Cancel selected organizations"
    
    def ban_organizations(self, request, queryset):
        updated = queryset.update(status='banned', is_active=False)
        self.message_user(
            request, 
            f'{updated} organizations were banned and deactivated.'
        )
    ban_organizations.short_description = "Ban selected organizations"
    
    def set_pending_status(self, request, queryset):
        updated = queryset.update(status='pending', is_active=False)
        self.message_user(
            request, 
            f'{updated} organizations were set to pending and deactivated.'
        )
    set_pending_status.short_description = "Set selected organizations to pending"
    
    def save_model(self, request, obj, form, change):
        # Enforce business rule: Only approved organizations can be active
        if obj.status == 'approved':
            obj.is_active = True
        else:
            obj.is_active = False
        super().save_model(request, obj, form, change)

@admin.register(OrganizationUser)
class OrganizationUserAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'created_at']
    list_filter = ['organization', 'created_at']
    search_fields = [
        'user__email', 
        'user__first_name', 
        'user__last_name',
        'organization__name'
    ]

@admin.register(OnchainVerification)
class OnchainVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'organization',
        'onchain_status',
        'trx_hash',
        'onchain_id',
        'created_at'
    ]
    list_filter = ['onchain_status', 'created_at']
    search_fields = [
        'organization__name',
        'trx_hash',
        'proposer_wallet'
    ]
    readonly_fields = ['created_at', 'updated_at']