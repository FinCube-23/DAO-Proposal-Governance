from organizations.repositories.organization_user_repository import OrganizationUserRepository
from organizations.repositories.organization_repository import OrganizationRepository
from users.repositories.user_repository import UserRepository
from event_handlers.utils.rabbitmq_publisher import RabbitMQPublisher
from logging_config import logger

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
        
        # Create organization user membership
        organization_user= OrganizationUserRepository.create_organization_user(user_id, organization_id)

        # Publish to RabbitMQ
        try:
            org_user_data = {
                'id': organization_user.id,
                'user_id': organization_user.user_id,
                'organization_id': organization_user.organization_id,
                'user_email': user.email,
                'organization_name': organization.name,
                'created_at': organization_user.created_at.isoformat(),
            }
            RabbitMQPublisher.publish_organization_user_created(org_user_data)
        except Exception as e:
            # Log error but don't fail organization user creation
            logger.error({"event": "Failed to publish organization user creation event", "error": str(e)})

        return organization_user
    
    @staticmethod
    def get_organization_users(organization_id, query_params):
        """
        Get paginated list of organization users with filtering, search, and sorting.
        """
        # Validate organization exists
        organization = OrganizationRepository.get_organization_by_id(organization_id)
        if not organization:
            raise Exception("Organization does not exist")
        
        # Validate and parse parameters
        page = int(query_params.get("page", 1))
        limit = int(query_params.get("limit", 10))

        if page < 1 or limit < 1:
            raise Exception("Page and limit must be positive numbers")

        # Prepare filters for user fields
        filters = {}
        if "status" in query_params:
            filters["status"] = query_params["status"]
        if "is_active" in query_params:
            filters["is_active"] = query_params["is_active"].lower() == "true"
        if "is_staff" in query_params:
            filters["is_staff"] = query_params["is_staff"].lower() == "true"
        if "is_verified_email" in query_params:
            filters["is_verified_email"] = query_params["is_verified_email"].lower() == "true"
        if "is_verified_contact_number" in query_params:
            filters["is_verified_contact_number"] = query_params["is_verified_contact_number"].lower() == "true"
        
        # Get search parameter
        search = query_params.get("search", "").strip()
        
        # Get sorting parameters
        sort_by = query_params.get("sort_by", "").strip()
        order = query_params.get("order", "desc").strip().lower()
        
        # Validate order parameter
        if order not in ["asc", "desc"]:
            order = "desc"

        # Delegate to repository
        return OrganizationUserRepository.get_organization_users(
            organization_id,
            page,
            limit,
            filters,
            search if search else None,
            sort_by if sort_by else None,
            order
        )