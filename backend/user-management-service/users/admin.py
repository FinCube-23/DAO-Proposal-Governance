# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'email',
        'id',
        'first_name', 
        'last_name',
        'status',
        'is_active',
        'is_staff',
        'is_verified_email',
        'date_joined'
    ]
    
    list_filter = [
        'status',
        'is_active',
        'is_staff',
        'is_superuser',
        'is_verified_email',
        'is_verified_contact_number',
        'date_joined'
    ]
    
    search_fields = [
        'id',
        'email',
        'first_name',
        'last_name',
        'contact_number'
    ]
    
    ordering = ['-date_joined']
    
    # Customize the fieldsets for the user detail page
    fieldsets = (
        ('User ID', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal info', {
            'fields': (
                'first_name', 
                'last_name', 
                'contact_number',
                'wallet_address'
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff', 
                'is_superuser'
            )
        }),
        ('Verification Status', {
            'fields': (
                'is_verified_email',
                'is_verified_contact_number'
            )
        }),
        ('User Status', {
            'fields': ('status', 'approved_by')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    readonly_fields = ['id', 'last_login', 'date_joined']
    
    # Fields to show when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'first_name',
                'last_name', 
                'contact_number',
                'password1',
                'password2'
            ),
        }),
    )
    
    # Actions for bulk operations
    actions = ['approve_users', 'reject_users', 'ban_users']
    
    def approve_users(self, request, queryset):
        updated = queryset.update(status='approved', is_active=True, approved_by=request.user)
        user_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request,
            f'{updated} users approved (IDs: {user_ids[:5]}{"..." if len(user_ids) > 5 else ""})'
        )
    approve_users.short_description = "Approve selected users"
    
    def reject_users(self, request, queryset):
        updated = queryset.update(status='rejected', is_active=False)
        user_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request,
            f'{updated} users rejected (IDs: {user_ids[:5]}{"..." if len(user_ids) > 5 else ""})'
        )
    reject_users.short_description = "Reject selected users"
    
    def ban_users(self, request, queryset):
        updated = queryset.update(status='banned', is_active=False)
        user_ids = list(queryset.values_list('id', flat=True))
        self.message_user(
            request,
            f'{updated} users banned (IDs: {user_ids[:5]}{"..." if len(user_ids) > 5 else ""})'
        )
    ban_users.short_description = "Ban selected users"