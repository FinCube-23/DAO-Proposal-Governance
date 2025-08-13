from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiExample,
    OpenApiTypes,
    OpenApiParameter,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate


from users.serializers import PasswordUpdateSerializer, UserLoginSerializer
from users.services import UserService
from users.utils import get_tokens_for_user


class AuthController(APIView):
    @extend_schema(
        request=UserLoginSerializer,
        responses={
            200: {"type": "object", "properties": {"status": {"type": "string"}}},
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def post(self, request):
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


class PasswordController(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=PasswordUpdateSerializer,
        responses={
            200: {"type": "object", "properties": {"status": {"type": "string"}}},
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
    )
    def post(self, request, user_id):
        serializer = PasswordUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = UserService.update_password(
                user_id,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
            return Response({"status": "Password updated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
