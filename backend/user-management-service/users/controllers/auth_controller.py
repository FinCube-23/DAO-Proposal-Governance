from rest_framework.viewsets import ViewSet
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes, action

from django.contrib.auth import authenticate


from users.serializers import (
    PasswordUpdateSerializer,
    UserLoginSerializer,
    PasswordUpdateResponseSerializer,
    LoginResponseSerializer,
)
from users.services import UserService
from users.utils import get_tokens_for_user


class AuthController(ViewSet):

    @extend_schema(
        request=UserLoginSerializer,
        responses={
            200: LoginResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    @action(
        detail=False,
        methods=["post"],
        authentication_classes=[],
        permission_classes=[AllowAny],
        url_path="login",
    )
    def login(self, request):
        login_serializer = UserLoginSerializer(data=request.data)
        login_serializer.is_valid(raise_exception=True)

        try:
            # Authenticate user
            user = authenticate(
                email=login_serializer.validated_data["email"],
                password=login_serializer.validated_data["password"],
            )
            if not user:
                raise ValueError("Invalid credentials")

            if not user.is_active:
                raise ValueError("User is inactive")

            # Generate tokens
            tokens = get_tokens_for_user(user)

            return Response(
                {"status": "success", "tokens": tokens}, status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": f"An unexpected error occurred: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordController(ViewSet):
    @extend_schema(
        request=PasswordUpdateSerializer,
        responses={
            200: PasswordUpdateResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        authentication_classes=[JWTAuthentication],
        permission_classes=[IsAuthenticated],
        url_path="update",
    )
    def update_password(self, request):
        serializer = PasswordUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = request.user
            user = UserService.update_password(
                user.id,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
            return Response({"status": "Password updated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
