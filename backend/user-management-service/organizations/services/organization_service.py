from organizations.repositories.organization_repository import OrganizationRepository
from users.repositories.user_repository import UserRepository
from event_handlers.utils.rabbitmq_publisher import RabbitMQPublisher
from logging_config import logger

class OrganizationService:
    
    @staticmethod
    def create_new_organization(organization_data):
        """
        Create a new organization with validation.
        """
        # Validate admin user exists
        admin_user = UserRepository.get_user_details_by_id(organization_data['organization_admin_id'])
        if not admin_user:
            raise Exception("Admin user does not exist")
        
        # Check if admin user is active
        if not admin_user.is_active:
            raise Exception("Admin user must be active")
        
        # Check for duplicate name
        if OrganizationRepository.get_organization_details_by_name(organization_data['name']):
            raise Exception("An organization with this name already exists")
        
        # Check for duplicate email
        if OrganizationRepository.get_organization_details_by_email(organization_data['email']):
            raise Exception("An organization with this email already exists")
        
        # Create organization
        organization = OrganizationRepository.create_new_organization(
            name=organization_data['name'],
            email=organization_data['email'],
            type=organization_data['type'],
            address=organization_data['address'],
            legal_entity_identifier=organization_data.get('legal_entity_identifier'),
            organization_admin_id=organization_data['organization_admin_id']
        )

        # Publish organization creation event to RabbitMQ
        try:
            org_data = {
                'id': organization.id,
                'organization_wallet_address': admin_user.wallet_address  # ✅ Use already-fetched admin_user
            }
            RabbitMQPublisher.publish_organization_created(org_data)
        except Exception as e:
            # Log error but don't fail organization creation
            logger.error({"event": "Failed to publish organization creation event", "error": str(e)})

        return organization
    
    @staticmethod
    def get_organization_list(query_params):
        """
        Get paginated list of organizations with filtering, search, and sorting.
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
        
        # Get search parameter
        search = query_params.get('search', '').strip()
        
        # Get sorting parameters
        sort_by = query_params.get('sort_by', '').strip()
        order = query_params.get('order', 'desc').strip().lower()
        
        # Validate order parameter
        if order not in ['asc', 'desc']:
            order = 'desc'
        
        # Delegate to repository
        return OrganizationRepository.get_organization_list(
            page, 
            limit, 
            filters, 
            search if search else None,
            sort_by if sort_by else None,
            order
        )
    
    @staticmethod
    def get_organization_details_by_id(org_id):
        """
        Get organization by ID with admin and onchain verification data.
        """
        organization = OrganizationRepository.get_organization_details_by_id(org_id)
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
    def update_organization_details_by_id(org_id, update_data):
        """
        Update organization (only email and address allowed).
        """
        organization = OrganizationService.get_organization_details_by_id(org_id)

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
        organization = OrganizationRepository.get_organization_details_by_id(org_id)
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
    
    @staticmethod
    def update_organization_status(org_ids, new_status):
        """
        Update organization status with validation of allowed transitions.
        Allowed transitions:
        - pending => approved or cancelled
        - approved => banned
        - banned => pending
        
        Returns dict with success count and skipped org IDs.
        """
        # Validate new status
        valid_statuses = ['pending', 'approved', 'cancelled', 'banned']
        if new_status not in valid_statuses:
            raise Exception(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        # Get all organizations
        organizations = OrganizationRepository.get_organization_list_by_ids(org_ids)
        
        if not organizations.exists():
            raise Exception("No organizations found with provided IDs")
        
        # Define allowed transitions
        allowed_transitions = {
            'pending': ['approved', 'cancelled'],
            'approved': ['banned'],
            'banned': ['pending']
        }
        
        # Filter organizations based on allowed transitions
        valid_org_ids = []
        skipped_org_ids = []
        
        for org in organizations:
            current_status = org.status
            
            # Check if transition is allowed
            if current_status in allowed_transitions:
                if new_status in allowed_transitions[current_status]:
                    valid_org_ids.append(org.id)
                else:
                    skipped_org_ids.append(org.id)
            else:
                # Status not in transition map, skip
                skipped_org_ids.append(org.id)
        
        # Perform bulk update for valid organizations
        updated_count = 0
        if valid_org_ids:
            updated_count = OrganizationRepository.bulk_update_organization_status(
                valid_org_ids, new_status
            )
        
        return {
            'updated_count': updated_count,
            'updated_ids': valid_org_ids,
            'skipped_ids': skipped_org_ids
        }