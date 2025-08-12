# organizations/repositories/organization_repository.py
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
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
    def get_all_organizations(page, limit, filters=None):
        filters = filters or {}
        queryset = Organization.objects.select_related('organization_admin').filter(**filters).order_by('-created_at')
        paginator = Paginator(queryset, limit)
        
        try:
            page_obj = paginator.page(page)
            return (
                list(page_obj.object_list.values()),  # Return serialized data
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
