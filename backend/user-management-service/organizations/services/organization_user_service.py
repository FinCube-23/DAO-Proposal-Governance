# organizations/services/organization_user_service.py
from organizations.repositories.organization_user_repository import OrganizationUserRepository
from organizations.repositories.organization_repository import OrganizationRepository
from users.repositories.user_repository import UserRepository

class OrganizationUserService:
    
    @staticmethod
    def create_organization_user(organization_user_data):
        """
        Create a new organization user membership with validation.
        """
        user_id = organization_user_data['user_id']
        organization_id = organization_user_data['organization_id']
        
        # Validate user exists
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise Exception("User does not exist")
        
        # Validate user is active
        if not user.is_active:
            raise Exception("User is inactive and cannot be added to an organization")
        
        # Validate organization exists
        organization = OrganizationRepository.get_organization_by_id(organization_id)
        if not organization:
            raise Exception("Organization does not exist")
        
        # Validate organization is active
        if not organization.is_active:
            raise Exception("Organization is inactive and cannot accept new members")
        
        # Create organization user membership
        return OrganizationUserRepository.create_organization_user(user_id, organization_id)