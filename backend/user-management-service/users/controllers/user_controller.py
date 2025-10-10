from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework import status, serializers
from users.models import User
from users.services import UserService
from users.dtos import UserRegistrationDTO
from users.serializers import (
    UserDetailSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    UserSelfUpdateSerializer,
    UserResponseSerializer,
    UserStatusResponseSerializer,
    UserStatusUpdateSerializer,
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
    logger.set_context("ProtectedUserController")

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
    def get_user_detail(self, request):
        logger.log({"event": "Getting user detail Started", "user_id": request.user.id})
        try:
            user_id = request.user.id
            user = UserService.get_user_with_organizations(user_id)
            serializer = UserDetailSerializer(
                user, context={"request": request, "user_id": user_id}
            )
            logger.log({"event": "Getting user detail Success", "user_id": user_id, "data": serializer.data})
            return Response(serializer.data)

        except Exception as e:
            logger.error({"event": "Getting user detail Error", "user_id": user_id, "error": str(e)})
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
    def get_user_detail_by_id(self, request, user_id):
        logger.log({"event": "Getting user detail by id Started", "user_id": user_id})
        try:
            user = UserService.get_user_with_organizations(user_id)
            serializer = UserDetailSerializer(
                user, context={"request": request, "user_id": user_id}
            )
            logger.log({"event": "Getting user detail by id Success", "user_id": user_id, "data": serializer.data})
            return Response(serializer.data)

        except Exception as e:
            logger.error({"event": "Getting user detail by id Error", "user_id": user_id, "error": str(e)})
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
    def update_user(self, request):
        """User self profile update (email/contact/wallet)"""
        logger.log({"event": "Updating user Started", "user_id": request.user.id})

        try:
            user = request.user
            # IMPORTANT: Pass the instance parameter
            serializer = UserSelfUpdateSerializer(
                instance=user, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            updated_user = UserService.partial_update(user.id, serializer.validated_data)
            logger.log({"event": "Updating user Success", "user_id": request.user.id, "data": UserSelfUpdateSerializer(updated_user).data})
            return Response(UserSelfUpdateSerializer(updated_user).data)
        except Exception as e:
            logger.error({"event": "Updating user Error", "user_id": request.user.id, "error": str(e)})
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    """
    Update user status. For now we are just checking if the JWT token is valid or not as role structure is not final yet.
    """

    @extend_schema(
        request=UserStatusUpdateSerializer,
        responses={
            200: UserStatusUpdateSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Update user status by user_id",
        description="Allows an authenticated user to update the status of any user by user_id.",
    )
    def update_user_status(self, request, user_id):
        logger.log({"event": "Updating user status Started", "user_id": user_id})
        try:
            serializer = UserStatusUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_user = UserService.update_status(
                user_id=user_id,
                approved_by=request.user.id,
                new_status=serializer.validated_data["status"],
            )
            logger.log({"event": "Updating user status Success", "user_id": user_id, "data": UserStatusUpdateSerializer(updated_user).data})
            response_serializer = UserStatusUpdateSerializer(updated_user)
            return Response({"status": "success", "data": response_serializer.data})
        except Exception as e:
            logger.error({"event": "Updating user status Error", "user_id": user_id, "error": str(e)})
            error_status = (
                status.HTTP_404_NOT_FOUND
                if "not found" in str(e).lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"status": "error", "message": str(e)}, status=error_status)

    """
    This will allow the user to check their status by email.
    """

    @extend_schema(
        responses={
            200: UserStatusResponseSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    def get_user_status(self, request, email):
        logger.log({"event": "Getting user status Started", "email": email})
        if not email:
            return Response(
                {"error": "Email parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = UserService.get_user_status_by_email(email)
            response_serializer = UserStatusResponseSerializer(user)
            logger.log({"event": "Getting user status Success", "email": email, "data": response_serializer.data})
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error({"event": "Getting user status Error", "email": email, "error": str(e)})
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
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
    )
    def get_user_list(self, request):
        logger.log({"event": "Getting user list Started", "data": request.query_params})
        try:
            users, pagination = UserService.get_users(request.query_params)
            serializer = UserListSerializer(users, many=True)
            return Response({"users": serializer.data, "pagination": pagination})
        except Exception as e:
            logger.error({"event": "Getting user list Error", "data": request.query_params, "error": str(e)})
            return Response({"error": str(e)}, status=400)


class PublicUserController(ViewSet):
    logger.set_context("PublicUserController")

    @extend_schema(
        request=UserRegistrationSerializer, responses={201: UserResponseSerializer}
    )
    def register(self, request):
        logger.log({"event": "Registering user Started", "data": request.data})
        

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

            response_serializer = UserResponseSerializer(user)
            logger.log({"event": "Registering user Success", "data": response_serializer.data})
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_201_CREATED,
            )



        except EmailAlreadyExistsError as e:
            logger.error({"event": "Registering user Conflict", "error": str(e)})
            return Response(
                {"status": "error", "message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error({"event": "Registering user Error", "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
