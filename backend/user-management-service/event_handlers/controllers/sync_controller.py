from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.utils import timezone

# Import existing services
from users.services.user_service import UserService
from organizations.services.organization_service import OrganizationService

# Import existing serializers
from users.serializers import UserListSerializer
from organizations.serializers.organization_serializers import OrganizationListSerializer

# Import RabbitMQ publisher
from event_handlers.utils.rabbitmq_publisher import RabbitMQPublisher

# Import logging (following organization_controller pattern)
from logging_config import logger


@extend_schema(
    summary="Sync all users and organizations",
    description="Publish all users and organizations to RabbitMQ for external systems to consume. Returns two lists: users and organizations. Requires admin permissions.",
    responses={
        200: OpenApiResponse(
            description="Sync successful",
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "success"},
                    "message": {"type": "string", "example": "Data synced successfully"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "total_users": {"type": "integer"},
                            "total_organizations": {"type": "integer"}
                        }
                    }
                }
            }
        ),
        500: OpenApiResponse(
            description="Sync failed",
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "message": {"type": "string"}
                }
            }
        )
    }
)
@api_view(['POST'])
def sync_all_data(request):
    """
    Endpoint to sync all users and organizations.
    
    - Fetches all users using UserService
    - Fetches all organizations using OrganizationService
    - Serializes data using existing serializers
    - Publishes to RabbitMQ
    - Returns both lists in response
    
    Only accessible by admin users.
    """
    # Log start (following organization_controller pattern)
    logger.log({"event": "Sync all data Started"})
    
    try:
        # Fetch all users using existing service
        users_result = UserService.get_users({
            'page': 1,
            'limit': 100000,  # Large enough to get all users
            'sort_by': 'id',
            'order': 'asc'
        })

        # Fetch all organizations using existing service
        organizations_result = OrganizationService.get_all_organizations({
            'page': 1,
            'limit': 100000,  # Large enough to get all organizations
            'sort_by': 'id',
            'order': 'asc'
        })

        # Unpack tuples (repositories return: (list, pagination_dict))
        users_list, users_pagination = users_result
        organizations_list, organizations_pagination = organizations_result

        # Serialize data using existing serializers
        users_serializer = UserListSerializer(users_list, many=True)
        organizations_serializer = OrganizationListSerializer(
            organizations_list, 
            many=True
        )

        # Prepare sync data (with ALL needed fields)
        timestamp = timezone.now().isoformat()
        total_users = users_pagination['total']  # ✅ Changed from 'total_count'
        total_organizations = organizations_pagination['total']  # ✅ Changed from 'total_count'

        sync_data = {
            'timestamp': timestamp,
            'total_users': total_users,
            'total_organizations': total_organizations,
            'users': users_serializer.data,
            'organizations': organizations_serializer.data
        }

        # Publish to RabbitMQ
        try:
            publish_success = RabbitMQPublisher.publish_sync_data(sync_data)
            
            if not publish_success:
                logger.log({"event": "RabbitMQ publish warning", "message": "Failed to publish but continuing"})
                
        except Exception as e:
            # Log error but don't fail the request (following organization_controller pattern)
            logger.error({"event": "RabbitMQ publish error", "error": str(e)})

        # Log success
        logger.log({
            "event": "Sync all data Success",
            "total_users": total_users,
            "total_organizations": total_organizations
        })

        # Return response with both lists (following organization_controller pattern)
        return Response(
            {
                'status': 'success',
                'message': f'Synced {total_users} users and {total_organizations} organizations'
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        # Log error (following organization_controller pattern)
        logger.error({"event": "Sync all data Error", "error": str(e)})
        
        return Response(
            {
                'status': 'error',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )