from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from organizations.models import Organization

class OrganizationRepository:
    
    @classmethod
    def create_organization(cls, name, email, type, address, legal_entity_identifier, organization_admin_id):
        return Organization.objects.create(
            name=name,
            email=email,
            type=type,
            address=address,
            legal_entity_identifier=legal_entity_identifier,
            organization_admin_id=organization_admin_id
        )

    @staticmethod
    def get_all_organizations(page, limit, filters=None, search=None, sort_by=None, order='desc'):
        filters = filters or {}
        queryset = Organization.objects.select_related('organization_admin').filter(**filters)
        
        # Apply search across multiple fields
        if search:
            search_query = Q(id__icontains=search) | \
                          Q(name__icontains=search) | \
                          Q(email__icontains=search) | \
                          Q(organization_admin__email__icontains=search) | \
                          Q(organization_admin__first_name__icontains=search) | \
                          Q(organization_admin__last_name__icontains=search)
            queryset = queryset.filter(search_query)
        
        # Apply sorting
        if sort_by:
            # Validate sort_by field to prevent injection
            allowed_sort_fields = ['id', 'name', 'email', 'type', 'status', 'is_active', 'created_at']
            if sort_by in allowed_sort_fields:
                order_prefix = '-' if order == 'desc' else ''
                queryset = queryset.order_by(f'{order_prefix}{sort_by}')
            else:
                queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
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
    def get_organization_by_id(org_id):
        try:
            return Organization.objects.select_related('organization_admin').prefetch_related(
                'onchain_verifications'
            ).get(pk=org_id)
        except ObjectDoesNotExist:
            return None

    @classmethod
    def update_organization(cls, org_id, email=None, address=None):
        try:
            organization = Organization.objects.get(pk=org_id)

            updated = False
            if email is not None:
                organization.email = email
                updated = True
            if address is not None:
                organization.address = address
                updated = True

            if updated:
                organization.save(update_fields=['email', 'address'])
            return organization

        except ObjectDoesNotExist:
            return None
        
    @classmethod
    def get_organization_by_name(cls, name):
        try:
            return Organization.objects.get(name=name)
        except ObjectDoesNotExist:
            return None

    @classmethod
    def get_organization_by_email(cls, email):
        try:
            return Organization.objects.get(email=email)
        except ObjectDoesNotExist:
            return None
        
    @classmethod
    def get_organization_id_by_admin_wallet(cls, wallet_address):
        """
        Get organization ID by admin wallet address.
        Uses a single efficient query that only fetches the ID.
        """
        try:
            # Use values_list to get only the ID - more efficient
            org_id = Organization.objects.filter(
                organization_admin__wallet_address=wallet_address
            ).values_list('id', flat=True).first()
            
            return org_id  # Returns None if not found, or the ID if found
        except Exception:
            return None
    
    @classmethod
    def get_organization_by_admin_wallet(cls, wallet_address):
        """
        Get full organization object by admin wallet address.
        """
        try:
            return Organization.objects.select_related('organization_admin').get(
                organization_admin__wallet_address=wallet_address
            )
        except Organization.DoesNotExist:
            return None
    
    @classmethod
    def bulk_update_organization_status(cls, org_ids, new_status):
        """
        Bulk update organization status.
        Returns list of updated organization IDs.
        """
        # Set is_active based on status
        is_active = True if new_status == 'approved' else False
        
        # Update organizations
        updated_count = Organization.objects.filter(
            id__in=org_ids
        ).update(status=new_status, is_active=is_active)
        
        return updated_count
    
    @classmethod
    def get_organizations_by_ids(cls, org_ids):
        """
        Get organizations by their IDs.
        """
        return Organization.objects.filter(id__in=org_ids)
