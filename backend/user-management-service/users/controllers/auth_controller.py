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
    logger.set_context("PublicAuthController")

    @extend_schema(
        request=UserLoginSerializer,
        responses={
            200: LoginResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def login(self, request):
        logger.log({"event": "Logging in Started", "data": request.data})

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
            logger.log({"event": "Logging in Success", "data": tokens})
            return Response(
                {"status": "success", "tokens": tokens}, status=status.HTTP_200_OK
            )

        except ValueError as e:
            logger.error({"event": "Logging in Error", "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error({"event": "Logging in Error", "error": str(e)})
            return Response(
                {
                    "status": "error",
                    "message": f"An unexpected error occurred: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProtectedAuthController(ViewSet):
    logger.set_context("ProtectedAuthController")
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PasswordUpdateSerializer,
        responses={
            200: PasswordUpdateResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def update_password(self, request):
        logger.log({"event": "Updating password Started", "data": request.data})

        try:
            serializer = PasswordUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = request.user
            user = UserService.update_password(
                user.id,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
            logger.log({"event": "Updating password Success", "user_id": user.id})
            return Response({"status": "Password updated successfully"})
        except Exception as e:
            logger.error({"event": "Updating password Error", "data": request.data, "error": str(e)})
            return Response({"error": str(e)}, status=400)

    @extend_schema(
        request=RefreshTokenRequestSerializer,
        responses={
            200: RefreshTokenResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def get_new_access_token(self, request):
        logger.log({"event": "Getting new access token Started", "data": request.data})
        try:
            serializer = RefreshTokenRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            validated = serializer.validated_data

            response_serializer = RefreshTokenResponseSerializer(validated)
            logger.log({"event": "Getting new access token Success", "data": response_serializer.data})
            return Response(
                {"status": "success", "tokens": response_serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error({"event": "Getting new access token Error", "data": request.data, "error": str(e)})
            return Response({"error": str(e)}, status=400)
