from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from organizations.models import OrganizationUser

class OrganizationUserRepository:

    @classmethod
    def add_user_to_organization(cls, user_id, organization_id):
        return OrganizationUser.objects.create(user_id=user_id, organization_id=organization_id)
    
    @classmethod
    def get_user_list_by_organization_id(cls, organization_id, page, limit, filters=None, search=None, sort_by=None, order='desc'):
        """
        Get paginated list of organization users with filtering, search, and sorting.
        """
        filters = filters or {}
        
        # Start with organization filter and select related user
        queryset = OrganizationUser.objects.filter(
            organization_id=organization_id
        ).select_related('user')
        
        # Apply additional filters on user fields
        user_filters = {}
        for key, value in filters.items():
            # Prefix with 'user__' to filter on related User model
            user_filters[f'user__{key}'] = value
        
        if user_filters:
            queryset = queryset.filter(**user_filters)
        
        # Apply search across user fields
        if search:
            search_query = Q(user__id__icontains=search) | \
                          Q(user__email__icontains=search) | \
                          Q(user__first_name__icontains=search) | \
                          Q(user__last_name__icontains=search) | \
                          Q(user__contact_number__icontains=search)
            queryset = queryset.filter(search_query)
        
        # Apply sorting on user fields
        if sort_by:
            # Validate sort_by field to prevent injection
            allowed_sort_fields = [
                'id', 'email', 'first_name', 'last_name', 'status',
                'is_active', 'is_staff', 'is_superuser', 'is_verified_email',
                'is_verified_contact_number', 'date_joined', 'updated_at'
            ]
            if sort_by in allowed_sort_fields:
                order_prefix = '-' if order == 'desc' else ''
                queryset = queryset.order_by(f'{order_prefix}user__{sort_by}')
            else:
                queryset = queryset.order_by('-user__date_joined')
        else:
            queryset = queryset.order_by('-user__date_joined')
        
        # Paginate
        paginator = Paginator(queryset, limit)
        
        try:
            page_obj = paginator.page(page)
            # Return User objects instead of OrganizationUser objects
            users = [org_user.user for org_user in page_obj.object_list]
            return (
                users,
                {'page': page, 'limit': limit, 'total': paginator.count}
            )
        except EmptyPage:
            raise Exception("Page not found")