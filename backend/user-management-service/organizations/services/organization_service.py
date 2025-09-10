from organizations.repositories.organization_repository import OrganizationRepository
from users.repositories.user_repository import UserRepository

class OrganizationService:
    
    @staticmethod
    def create_organization(organization_data):
        """
        Create a new organization with validation.
        """
        # Validate admin user exists
        admin_user = UserRepository.get_user_by_id(organization_data['organization_admin_id'])
        if not admin_user:
            raise Exception("Admin user does not exist")
        
        # Check if admin user is active
        if not admin_user.is_active:
            raise Exception("Admin user must be active")
        
        # Check for duplicate name
        if OrganizationRepository.get_organization_by_name(organization_data['name']):
            raise Exception("An organization with this name already exists")
        
        # Check for duplicate email
        if OrganizationRepository.get_organization_by_email(organization_data['email']):
            raise Exception("An organization with this email already exists")
        
        # Create organization
        return OrganizationRepository.create_organization(
            name=organization_data['name'],
            email=organization_data['email'],
            type=organization_data['type'],
            address=organization_data['address'],
            legal_entity_identifier=organization_data.get('legal_entity_identifier'),
            organization_admin_id=organization_data['organization_admin_id']
        )
    
    @staticmethod
    def get_all_organizations(query_params):
        """
        Get paginated list of organizations with filtering.
        """
        # Validate and parse parameters
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 10))
        
        if page < 1 or limit < 1:
            raise Exception("Page and limit must be positive numbers")
        
        # Prepare filters
        filters = {}
        if 'status' in query_params and query_params['status'] != 'all':  
            filters['status'] = query_params['status']
        if 'is_active' in query_params:
            filters['is_active'] = query_params['is_active'].lower() == 'true'
        if 'type' in query_params and query_params['type'] != 'all':
            filters['type'] = query_params['type']
        
        # Delegate to repository
        return OrganizationRepository.get_all_organizations(page, limit, filters)
    
    @staticmethod
    def get_organization_by_id(org_id):
        """
        Get organization by ID with admin and onchain verification data.
        """
        organization = OrganizationRepository.get_organization_by_id(org_id)
        if not organization:
            raise Exception("Organization not found")
        return organization
    
    @staticmethod
    def get_organization_id_by_admin_wallet(wallet_address):
        """
        Get organization ID by admin wallet address.
        Returns None if not found.
        """
        # Validate wallet address format
        if not wallet_address or not wallet_address.startswith("0x") or len(wallet_address) != 42:
            return None  # Invalid format returns None
        
        return OrganizationRepository.get_organization_id_by_admin_wallet(wallet_address)

    @staticmethod
    def update_organization(org_id, update_data):
        """
        Update organization (only email and address allowed).
        """
        organization = OrganizationService.get_organization_by_id(org_id)

        # Filter allowed fields
        allowed_fields = {'email', 'address'}
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}

        if not filtered_data:
            raise Exception("Only email and address can be updated")

        # Check email uniqueness if changed
        if 'email' in filtered_data and filtered_data['email'].lower() != organization.email.lower():
            if OrganizationRepository.get_organization_by_email(filtered_data['email']):  # Fixed method name
                raise Exception("An organization with this email already exists")
            
        # Call repository with correct signature
        return OrganizationRepository.update_organization(
            org_id=org_id,
            email=filtered_data.get('email'),
            address=filtered_data.get('address')
        )
    
    @staticmethod
    def validate_organization_exists(org_id):
        """
        Helper method to validate organization exists.
        """
        organization = OrganizationRepository.get_organization_by_id(org_id)
        if not organization:
            raise Exception("Organization not found")
        return organization
    
    @staticmethod
    def check_admin_permissions(user_id, org_id):
        """
        Check if user is admin of the organization.
        """
        organization = OrganizationService.validate_organization_exists(org_id)
        if organization.organization_admin_id != user_id:
            raise Exception("User is not the admin of this organization")
        return organization