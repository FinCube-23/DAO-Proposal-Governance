from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.services import UserService
from users.dtos import UserRegistrationDTO
from users.serializers import (
    UserDetailSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    UserSelfUpdateSerializer,
    UserDetailsResponseSerializer,
    UserStatusResponseSerializer,
    UserStatusUpdateSerializer,
    UserStatusUpdateByIdSerializer
)
from users.utils.exceptions import EmailAlreadyExistsError
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
    OpenApiParameter,
)
from logging_config import logger

class ProtectedUserController(ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    """"
    This will return details of the logged in user along with their organization memberships.
    """

    @extend_schema(
        responses={
            200: UserDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    def get_user_details(self, request):
        logger.set_context("get_user_details")
        logger.log({"message": "Getting user detail Started", "user_id": request.user.id})
        try:
            user_id = request.user.id
            user = UserService.get_user_details_with_organization_list(user_id)
            serializer = UserDetailSerializer(
                user, context={"request": request, "user_id": user_id}
            )
            logger.log({"message": "Getting user detail Success", "user_id": user_id, "data": serializer.data})
            return Response(serializer.data)

        except Exception as e:
            logger.error({"message": "Getting user detail Error", "user_id": user_id, "error": str(e)})
            return Response(
                {"error": str(e)},
                status=(
                    status.HTTP_404_NOT_FOUND
                    if "not found" in str(e).lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )

    """"
    This will return details of the logged in user along with their organization memberships.
    """

    @extend_schema(
        responses={
            200: UserDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    def get_user_details_by_id(self, request, user_id):
        logger.set_context("get_user_detail_by_id")
        logger.log({"message": "Getting user detail by id Started", "user_id": user_id})
        try:
            user = UserService.get_user_details_with_organization_list(user_id)
            serializer = UserDetailSerializer(
                user, context={"request": request, "user_id": user_id}
            )
            logger.log({"message": "Getting user detail by id Success", "user_id": user_id, "data": serializer.data})
            return Response(serializer.data)

        except Exception as e:
            logger.error({"message": "Getting user detail by id Error", "user_id": user_id, "error": str(e)})
            return Response(
                {"error": str(e)},
                status=(
                    status.HTTP_404_NOT_FOUND
                    if "not found" in str(e).lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )

    """
    This will allow the user to update their own profile information such as email, contact number, and wallet address.
    """

    @extend_schema(request=UserSelfUpdateSerializer, responses=UserSelfUpdateSerializer)
    def update_user_details(self, request):
        """User self profile update (email/contact/wallet)"""
        logger.set_context("update_user_details")
        logger.log({"message": "Updating user Started", "user_id": request.user.id})

        try:
            user = request.user
            # IMPORTANT: Pass the instance parameter
            serializer = UserSelfUpdateSerializer(
                instance=user, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            updated_user = UserService.partially_update_user_details(user.id, serializer.validated_data)
            logger.log({"message": "Updating user Success", "user_id": request.user.id, "data": UserSelfUpdateSerializer(updated_user).data})
            return Response(UserSelfUpdateSerializer(updated_user).data)
        except Exception as e:
            logger.error({"message": "Updating user Error", "user_id": request.user.id, "error": str(e)})
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    """
    This will allow the user to check their status by email.
    """

    @extend_schema(
        responses={
            200: UserStatusResponseSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    def get_user_status_by_email(self, request, email):
        logger.set_context("get_user_status_by_email")
        logger.log({"message": "Getting user status Started", "email": email})
        if not email:
            return Response(
                {"error": "Email parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = UserService.get_user_status_by_email(email)
            response_serializer = UserStatusResponseSerializer(user)
            logger.log({"message": "Getting user status Success", "email": email, "data": response_serializer.data})
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error({"message": "Getting user status Error", "email": email, "error": str(e)})
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
                enum=[
                    choice[0] for choice in User.STATUS_CHOICES
                ],  # Dynamically pull choices
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
            400: OpenApiTypes.OBJECT,
        },
        summary="List all users",
        description="Retrieve a paginated list of all users with optional filtering, search, and sorting.",
    )
    def get_user_list(self, request):
        logger.set_context("get_user_list")
        logger.log({"message": "Getting user list Started", "data": request.query_params})
        try:
            users, pagination = UserService.get_user_list(request.query_params)
            serializer = UserListSerializer(users, many=True)
            return Response({"users": serializer.data, "pagination": pagination})
        except Exception as e:
            logger.error({"message": "Getting user list Error", "data": request.query_params, "error": str(e)})
            return Response({"error": str(e)}, status=400)
    

    @extend_schema(
        request=UserStatusUpdateSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "message": {"type": "string"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "updated_count": {"type": "integer"},
                            "updated_ids": {"type": "array", "items": {"type": "integer"}},
                            "skipped_ids": {"type": "array", "items": {"type": "integer"}},
                        }
                    }
                }
            },
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Change user status",
        description=(
            "Change status for one or multiple users. "
            "Allowed transitions: pending→approved/rejected, approved→banned, banned→pending. "
            "Invalid transitions are skipped without error."
        ),
    )
    def update_user_status(self, request):
        """
        Update user status (single or bulk).
        Allowed transitions:
        - pending => approved or rejected
        - approved => banned
        - banned => pending
        
        Invalid transitions are skipped.
        
        in -> user_ids (list), status
        out -> updated_count, updated_ids, skipped_ids
        """
        logger.set_context("update_user_status")
        logger.log({"message": "Changing user status Started", "data": request.data})
        
        try:
            serializer = UserStatusUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            result = UserService.update_user_status(
                user_ids=serializer.validated_data['user_ids'],
                new_status=serializer.validated_data['status'],
                approved_by=request.user.id
            )
            
            logger.log({"message": "Changing user status Success", "data": result})
            
            return Response({
                "status": "success",
                "message": f"Updated {result['updated_count']} user(s)",
                "data": result
            })
            
        except Exception as e:
            logger.error({"message": "Changing user status Error", "data": request.data, "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


    @extend_schema(
        request=UserStatusUpdateByIdSerializer,
        responses={
            200: UserStatusUpdateByIdSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Update user status by user_id",
        description="Allows an authenticated user to update the status of any user by user_id.",
    )
    def update_user_status_by_id(self, request, user_id):
        logger.set_context("update_user_status_by_id")
        logger.log({"message": "Updating user status Started", "user_id": user_id})
        try:
            serializer = UserStatusUpdateByIdSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_user = UserService.update_user_status_by_id(
                user_id=user_id,
                approved_by=request.user.id,
                new_status=serializer.validated_data["status"],
            )
            logger.log({"message": "Updating user status Success", "user_id": user_id, "data": UserStatusUpdateByIdSerializer(updated_user).data})
            response_serializer = UserStatusUpdateByIdSerializer(updated_user)
            return Response({"status": "success", "data": response_serializer.data})
        except Exception as e:
            logger.error({"message": "Updating user status Error", "user_id": user_id, "error": str(e)})
            error_status = (
                status.HTTP_404_NOT_FOUND
                if "not found" in str(e).lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"status": "error", "message": str(e)}, status=error_status)

class PublicUserController(ViewSet):

    @extend_schema(
        request=UserRegistrationSerializer, responses={201: UserDetailsResponseSerializer}
    )
    def register_user(self, request):
        logger.set_context("register_user")
        logger.log({"message": "Registering user Started", "data": request.data})

        try:
            registration_serializer = UserRegistrationSerializer(data=request.data)
            registration_serializer.is_valid(raise_exception=True)
            user_dto = UserRegistrationDTO(
                email=registration_serializer.validated_data["email"],
                first_name=registration_serializer.validated_data["first_name"],
                last_name=registration_serializer.validated_data["last_name"],
                contact_number=registration_serializer.validated_data["contact_number"],
                password=registration_serializer.validated_data["password"],
            )

            user = UserService.register_user(user_dto)

            response_serializer = UserDetailsResponseSerializer(user)
            logger.log({"message": "Registering user Success", "data": response_serializer.data})
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_201_CREATED,
            )

        except EmailAlreadyExistsError as e:
            logger.error({"message": "Registering user Conflict", "error": str(e)})
            return Response(
                {"status": "error", "message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error({"message": "Registering user Error", "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
