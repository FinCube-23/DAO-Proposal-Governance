# users/serializers/registration.py
from rest_framework import serializers
from organizations.models import Organization
from users.models import User
from typing import Optional
from drf_spectacular.utils import extend_schema_field, OpenApiExample
from phonenumber_field.serializerfields import PhoneNumberField
from users.utils import get_tokens_for_user
from django.contrib.auth import authenticate


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}, min_length=8
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "contact_number",
            "password",
            "password_confirm",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},  # Added this
            "contact_number": {"required": True},
        }

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )

        # Validate contact number format if needed
        if not data["contact_number"].startswith("+"):
            raise serializers.ValidationError(
                {"contact_number": "Must include country code (e.g. +880)"}
            )

        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        write_only=True,
        required=True,
    )
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}, min_length=8
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "password": {"required": True},
        }


class UserResponseSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    contact_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "contact_number", "date_joined"]
        read_only_fields = fields

    @extend_schema_field(str)
    def get_full_name(self, obj) -> Optional[str]:
        return f"{obj.first_name} {obj.last_name}".strip() or None

    @extend_schema_field(str)
    def get_contact_number(self, obj) -> Optional[str]:
        return str(obj.contact_number) if obj.contact_number else None


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_active", "is_staff"]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "contact_number",
            "is_active",
            "is_staff",
            "status",
            "organizations",
        ]
        read_only_fields = fields

    def get_organizations(self, obj):
        if not hasattr(obj, "organization_memberships"):
            return []

        return [
            {
                "id": m.organization.id,
                "name": m.organization.name,
                "is_admin": m.organization.organization_admin_id == obj.id,
            }
            for m in obj.organization_memberships.all()
        ]


class UserSelfUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "contact_number", "wallet_address"]
        extra_kwargs = {
            "email": {"required": False},
            "contact_number": {"required": False},
            "wallet_address": {"required": False},
        }

    def validate(self, data):
        # Block restricted fields even if somehow passed
        restricted_fields = {
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "is_superuser",
            "is_verified_email",
            "is_verified_contact_number",
            "password",
            "status",
        }
        if restricted_fields.intersection(data.keys()):
            raise serializers.ValidationError("Attempted to modify restricted fields")
        return data


class PasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(
        required=True, write_only=True, min_length=8
    )

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError("New passwords don't match")
        return data


class PasswordUpdateResponseSerializer(serializers.Serializer):
    status = serializers.CharField()


class TokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    tokens = TokenSerializer()


class UserStatusResponseSerializer(serializers.ModelSerializer):
    status = serializers.CharField()
    is_superuser = serializers.BooleanField()
    is_staff = serializers.BooleanField()
    is_active = serializers.BooleanField()
    is_verified_email = serializers.BooleanField()
    is_verified_contact_number = serializers.BooleanField()

    class Meta:
        model = User
        fields = [
            "status",
            "is_superuser",
            "is_staff",
            "is_active",
            "is_verified_email",
            "is_verified_contact_number",
        ]
        read_only_fields = fields
