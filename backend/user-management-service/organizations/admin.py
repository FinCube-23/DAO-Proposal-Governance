from django.contrib import admin
from django.utils.html import format_html
from .models import Organization, OrganizationUser, OnchainVerification

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'display_org_admin',
        'id', 
        'email', 
        'type', 
        'status', 
        'is_active',
        'created_at'
    ]
    
    list_select_related = ['organization_admin']
    
    list_filter = [
        'status',
        'type', 
        'is_active',
        'created_at'
    ]
    
    search_fields = [
        'id',
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
    
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    # Add actions for bulk status changes
    actions = ['approve_organizations', 'cancel_organizations', 'ban_organizations', 'set_pending_status']
    
    def approve_organizations(self, request, queryset):
        updated = queryset.update(status='approved', is_active=True)
        org_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request, 
            f'{updated} organizations approved and activated (IDs: {org_ids[:5]}{"..." if len(org_ids) > 5 else ""})'
        )
    approve_organizations.short_description = "Approve selected organizations"
    
    def cancel_organizations(self, request, queryset):
        updated = queryset.update(status='cancelled', is_active=False)
        org_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request, 
            f'{updated} organizations cancelled and deactivated (IDs: {org_ids[:5]}{"..." if len(org_ids) > 5 else ""})'
        )
    cancel_organizations.short_description = "Cancel selected organizations"
    
    def ban_organizations(self, request, queryset):
        updated = queryset.update(status='banned', is_active=False)
        org_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request, 
            f'{updated} organizations banned and deactivated (IDs: {org_ids[:5]}{"..." if len(org_ids) > 5 else ""})'
        )
    ban_organizations.short_description = "Ban selected organizations"
    
    def set_pending_status(self, request, queryset):
        updated = queryset.update(status='pending', is_active=False)
        org_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request, 
            f'{updated} organizations set to pending and deactivated (IDs: {org_ids[:5]}{"..." if len(org_ids) > 5 else ""})'
        )
    set_pending_status.short_description = "Set selected organizations to pending"
    
    def display_org_admin(self, obj):
        if obj.organization_admin:
            link = f"/admin/users/user/{obj.organization_admin.id}/change/"
            return format_html(f'<a href="{link}">{obj.organization_admin.get_full_name() or obj.organization_admin.email}</a>')
        return "No Admin"
    display_org_admin.short_description = "Organization Admin"
    
    def save_model(self, request, obj, form, change):
        # Enforce business rule: Only approved organizations can be active
        if obj.status == 'approved':
            obj.is_active = True
        else:
            obj.is_active = False
        super().save_model(request, obj, form, change)

@admin.register(OrganizationUser)
class OrganizationUserAdmin(admin.ModelAdmin):
    list_display = ['user', 'display_organization', 'created_at']
    
    # Optimize ForeignKey relationships to avoid the N+1 query problem
    list_select_related = ['user', 'organization']
    
    # Optimize ManyToMany relationships
    list_prefetch_related = ['groups', 'user_permissions']
    
    list_filter = ['organization', 'created_at', 'groups']
    search_fields = [
        'user__email', 
        'user__first_name', 
        'user__last_name',
        'organization__name'
    ]

    filter_horizontal = ['groups', 'user_permissions']

    fieldsets = (
        (None, {
            'fields': ('user', 'organization')
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
        }),
    )

    def list_groups(self, obj):
        """Display groups as comma-separated list"""
        return ", ".join([g.name for g in obj.groups.all()]) or "No groups"
    list_groups.short_description = "Groups"
    
    def display_organization(self, obj):
        link = f"/admin/organizations/organization/{obj.organization.id}/change/"
        return format_html(f'<a href="{link}">{obj.organization.name}</a>')
    display_organization.short_description = "Organization"
    
    
@admin.register(OnchainVerification)
class OnchainVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'organization',
        'id',
        'onchain_status',
        'trx_hash',
        'onchain_id',
        'created_at'
    ]
    list_filter = ['onchain_status', 'created_at']
    list_select_related = ['organization']
    search_fields = [
        'organization__name',
        'trx_hash',
        'proposer_wallet'
    ]
    readonly_fields = ['created_at', 'updated_at']