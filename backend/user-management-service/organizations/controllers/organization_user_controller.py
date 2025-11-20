from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from organizations.services.organization_user_service import OrganizationUserService
from organizations.serializers.organization_user_serializers import (
    OrganizationUserCreateSerializer,
    OrganizationUserResponseSerializer,
)
from organizations.models import Organization
from users.models import User
from users.serializers import UserListSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from logging_config import logger

class ProtectedOrganizationUserController(ViewSet):
    logger.set_context("ProtectedOrganizationUserController")
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=OrganizationUserCreateSerializer,
        responses={
            201: OrganizationUserResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Add user to organization",
        description="Create a new organization user membership by adding a user to an organization.",
    )
    def add_user_to_organization(self, request):
        """
        Add a user to an organization.
        Creates a new organization user membership with proper validation.
        """
        logger.log({"event": "Adding user to organization Started", "data": request.data})
        

        try:
            serializer = OrganizationUserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            organization_user = OrganizationUserService.create_organization_user(
                serializer.validated_data
            )

            response_serializer = OrganizationUserResponseSerializer(organization_user)
            logger.log({"event": "Adding user to organization Success", "data": response_serializer.data})
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error({"event": "Adding user to organization Error", "data": request.data, "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
                description="Page number",
            ),
            OpenApiParameter(
                name="limit",
                type=OpenApiTypes.INT,
                description="Items per page",
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                description="Filter by user status",
                enum=[choice[0] for choice in User.STATUS_CHOICES],
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                description="Filter active users",
            ),
            OpenApiParameter(
                name="is_staff",
                type=OpenApiTypes.BOOL,
                description="Filter staff users",
            ),
            OpenApiParameter(
                name="is_verified_email",
                type=OpenApiTypes.BOOL,
                description="Filter users by email verification status",
            ),
            OpenApiParameter(
                name="is_verified_contact_number",
                type=OpenApiTypes.BOOL,
                description="Filter users by contact number verification status",
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search by id, email, first name, last name, or contact number",
            ),
            OpenApiParameter(
                name="sort_by",
                type=OpenApiTypes.STR,
                description="Sort by field",
                enum=[
                    'id', 'email', 'first_name', 'last_name', 'status',
                    'is_active', 'is_staff', 'is_superuser', 'is_verified_email',
                    'is_verified_contact_number', 'date_joined', 'updated_at'
                ],
            ),
            OpenApiParameter(
                name="order",
                type=OpenApiTypes.STR,
                description="Sort order",
                enum=['asc', 'desc'],
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Get users of an organization",
        description="Retrieve a paginated list of all users belonging to a specific organization with optional filtering, search, and sorting.",
    )
    def get_organization_users(self, request, org_id):
        """
        Get all users belonging to an organization with filtering, search, sorting, and pagination.
        """
        logger.log({"event": "Getting organization users Started", "org_id": org_id, "params": request.query_params})
        try:
            users, pagination = OrganizationUserService.get_organization_users(
                org_id, 
                request.query_params
            )
            serializer = UserListSerializer(users, many=True)
            logger.log({"event": "Getting organization users Success", "org_id": org_id, "count": len(users)})
            return Response(
                {
                    "org_users": serializer.data,
                    "pagination": pagination
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error({"event": "Getting organization users Error", "org_id": org_id, "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )