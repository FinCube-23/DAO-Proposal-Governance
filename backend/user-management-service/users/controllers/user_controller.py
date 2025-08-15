from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes, action

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
)
from users.utils.exceptions import EmailAlreadyExistsError
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
    OpenApiParameter,
)


class UserProfileController(ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: UserDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    # @action(
    #     detail=False,
    #     methods=["get"],
    #     authentication_classes=[JWTAuthentication],
    #     permission_classes=[IsAuthenticated],
    #     url_path="details",
    # )
    def get_user_detail(self, request):
        try:
            user_id = request.user.id
            user = UserService.get_user_with_organizations(user_id)
            print(f"Memberships count: {user.organization_memberships.count()}")
            serializer = UserDetailSerializer(
                user, context={"request": request, "user_id": user_id}
            )
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=(
                    status.HTTP_404_NOT_FOUND
                    if "not found" in str(e).lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )

    @extend_schema(request=UserSelfUpdateSerializer, responses=UserSelfUpdateSerializer)
    # @action(
    #     detail=False,
    #     methods=["patch"],
    #     authentication_classes=[JWTAuthentication],
    #     permission_classes=[IsAuthenticated],
    #     url_path="update",
    # )
    def update_user(self, request):
        """User self profile update (email/contact/wallet)"""
        user_id = request.user.id
        serializer = UserSelfUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = UserService.partial_update(user_id, serializer.validated_data)
            return Response(UserSelfUpdateSerializer(user).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={
            200: UserStatusResponseSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        }
    )
    # @action(
    #     detail=False,
    #     methods=["get"],
    #     authentication_classes=[JWTAuthentication],
    #     permission_classes=[IsAdminUser],
    #     url_path=r"status/(?P<email>.+)",
    # )
    def get_user_status(self, request, email):
        print("email is ", email)
        if not email:
            return Response(
                {"error": "Email parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = UserService.get_user_status_by_email(email)
            response_serializer = UserStatusResponseSerializer(user)
            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserController(ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=UserRegistrationSerializer, responses={201: UserResponseSerializer}
    )
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        registration_serializer = UserRegistrationSerializer(data=request.data)
        registration_serializer.is_valid(raise_exception=True)

        try:
            user_dto = UserRegistrationDTO(
                email=registration_serializer.validated_data["email"],
                first_name=registration_serializer.validated_data["first_name"],
                last_name=registration_serializer.validated_data["last_name"],
                contact_number=registration_serializer.validated_data["contact_number"],
                password=registration_serializer.validated_data["password"],
            )

            user = UserService.register_user(user_dto)

            response_serializer = UserResponseSerializer(user)

            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_201_CREATED,
            )

        except EmailAlreadyExistsError as e:
            return Response(
                {"status": "error", "message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # @action(
    #     detail=False,
    #     methods=["get"],
    #     authentication_classes=[JWTAuthentication],
    #     permission_classes=[IsAdminUser],
    #     url_path="user-list",
    # )
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
        try:
            users, pagination = UserService.get_users(request.query_params)
            serializer = UserListSerializer(users, many=True)
            return Response({"users": serializer.data, "pagination": pagination})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
