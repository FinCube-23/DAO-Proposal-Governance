from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from users.models import User

class UserRepository:
    
    @classmethod
    def get_user_by_email(cls, email):
        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            return None

    @classmethod
    def create_user(cls, user_dto):
        return User.objects.create_user(
            email=user_dto.email,
            first_name=user_dto.first_name,
            last_name=user_dto.last_name,
            contact_number=user_dto.contact_number,
            password=user_dto.password
        )

    @classmethod
    def update_wallet_address(cls, user_id, wallet_address):
        user = User.objects.get(id=user_id)
        user.wallet_address = wallet_address
        user.save()
        return user

    @staticmethod
    def get_user_details_with_organization_list(user_id):
        return User.objects.prefetch_related(
            'organization_memberships__organization'
        ).get(pk=user_id)

    @staticmethod
    def get_users(page, limit, filters=None, search=None, sort_by=None, order='desc'):
        filters = filters or {}
        queryset = User.objects.filter(**filters)
        
        # Apply search across multiple fields (matching UserAdmin search_fields)
        if search:
            search_query = Q(id__icontains=search) | \
                          Q(email__icontains=search) | \
                          Q(first_name__icontains=search) | \
                          Q(last_name__icontains=search) | \
                          Q(contact_number__icontains=search)
            queryset = queryset.filter(search_query)
        
        # Apply sorting
        if sort_by:
            # Validate sort_by field to prevent injection
            allowed_sort_fields = [
                'id', 'email', 'first_name', 'last_name', 'status', 
                'is_active', 'is_staff', 'is_superuser', 'is_verified_email',
                'is_verified_contact_number', 'date_joined', 'updated_at'
            ]
            if sort_by in allowed_sort_fields:
                order_prefix = '-' if order == 'desc' else ''
                queryset = queryset.order_by(f'{order_prefix}{sort_by}')
            else:
                queryset = queryset.order_by('-date_joined')
        else:
            queryset = queryset.order_by('-date_joined')
        
        paginator = Paginator(queryset, limit)
        
        try:
            page_obj = paginator.page(page)
            return (
                list(page_obj.object_list),
                {'page': page, 'limit': limit, 'total': paginator.count}
            )
        except EmptyPage:
            raise Exception("Page not found")
        
    @staticmethod
    def get_user_details_by_id(user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
    
    @classmethod
    def bulk_update_user_status(cls, user_ids, new_status, approved_by_id):
        """
        Bulk update user status.
        Returns count of updated users.
        """
        # Set is_active based on status
        if new_status == "approved":
            is_active = True
        elif new_status in ("rejected", "banned"):
            is_active = False
        else:
            is_active = None  # pending keeps current state
        
        # Build update dict
        update_fields = {
            'status': new_status,
        }
        
        if new_status in ("approved", "rejected", "banned"):
            update_fields['approved_by_id'] = approved_by_id
        else:
            update_fields['approved_by_id'] = None
        
        if is_active is not None:
            update_fields['is_active'] = is_active
        
        # Update users
        updated_count = User.objects.filter(
            id__in=user_ids
        ).update(**update_fields)
        
        return updated_count
    
    @classmethod
    def get_users_by_ids(cls, user_ids):
        """
        Get users by their IDs.
        """
        return User.objects.filter(id__in=user_ids)