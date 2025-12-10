from rest_framework.viewsets import ViewSet
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import authenticate


from users.serializers import (
    PasswordUpdateSerializer,
    UserLoginSerializer,
    PasswordUpdateResponseSerializer,
    LoginResponseSerializer,
    RefreshTokenRequestSerializer,
    RefreshTokenResponseSerializer,
)
from users.services import UserService
from users.utils import get_tokens_for_user
from logging_config import logger

class PublicAuthController(ViewSet):
    @extend_schema(
        request=UserLoginSerializer,
        responses={
            200: LoginResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def login_user(self, request):
        logger.set_context("login_user")
        logger.log({
            "message": "User Log-in operation Started", "data": request.data})

        try:
            login_serializer = UserLoginSerializer(data=request.data)
            login_serializer.is_valid(raise_exception=True)
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
            logger.log({"message": "Successfully log-in user"})
            return Response(
                {"status": "success", "tokens": tokens}, status=status.HTTP_200_OK
            )

        except ValueError as e:
            logger.error({"message": "Failed to log-in user", "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error({"message": "Failed to log-in user", "error": str(e)})
            return Response(
                {
                    "status": "error",
                    "message": f"An unexpected error occurred: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProtectedAuthController(ViewSet):
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PasswordUpdateSerializer,
        responses={
            200: PasswordUpdateResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def update_user_password(self, request):
        logger.set_context("update_user_password")
        logger.log({"message": "Updating user password operation Started", "data": request.data})

        try:
            serializer = PasswordUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = request.user
            user = UserService.update_user_password(
                user.id,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
            logger.log({"message": "Password updated successfully", "user_id": user.id})
            return Response({"status": "Password updated successfully"})
        except Exception as e:
            logger.error({"message": "Password updation failed", "data": request.data, "error": str(e)})
            return Response({"error": str(e)}, status=400)

    @extend_schema(
        request=RefreshTokenRequestSerializer,
        responses={
            200: RefreshTokenResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def get_new_access_token(self, request):
        logger.set_context("get_new_access_token")
        logger.log({"message": "Getting new access token operation Started", "data": request.data})
        try:
            serializer = RefreshTokenRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            validated = serializer.validated_data

            response_serializer = RefreshTokenResponseSerializer(validated)
            logger.log({"message": "Getting new access token operation Successful", "data": response_serializer.data})
            return Response(
                {"status": "success", "tokens": response_serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error({"message": "Failed to get new access token", "data": request.data, "error": str(e)})
            return Response({"error": str(e)}, status=400)
