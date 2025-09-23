from rest_framework import serializers
from users.models import User
from typing import Optional
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from drf_spectacular.utils import extend_schema_field


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

    def validate_email(self, value):
        """Custom email validation that excludes current user"""
        # If email hasn't changed, allow it
        if self.instance and value == self.instance.email:
            return value

        # Check for uniqueness excluding current user
        if User.objects.filter(email=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("User with this email address already exists.")
        return value

    def validate_contact_number(self, value):
        """Custom contact number validation that excludes current user"""
        # If contact number hasn't changed, allow it
        if self.instance and str(value) == str(self.instance.contact_number):
            return value

        # Check for uniqueness excluding current user
        if User.objects.filter(contact_number=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("User with this contact number already exists.")
        return value

    def validate_wallet_address(self, value):
        """Custom wallet address validation that excludes current user"""
        # Allow None/empty values
        if not value:
            return value

        # If wallet address hasn't changed, allow it
        if self.instance and value == self.instance.wallet_address:
            return value

        # Check for uniqueness excluding current user
        if User.objects.filter(wallet_address=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("User with this wallet address already exists.")
        return value

    def validate(self, data):
        """Overall validation and security check"""
        # Block restricted fields
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
            "approved_by",
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


class UserStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in User.STATUS_CHOICES]
    )

    class Meta:
        model = User
        fields = ["status"]

    def validate(self, data):
        if set(data.keys()) != {"status"}:
            raise serializers.ValidationError("Only status can be updated.")
        return data


class RefreshTokenRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True, required=True)

    access = serializers.CharField(read_only=True)

    def validate(self, attrs):
        refresh_token_str = attrs.get("refresh")
        if not refresh_token_str:
            raise serializers.ValidationError({"refresh": "This field is required."})

        try:
            token = RefreshToken(refresh_token_str)
            data = {"access": str(token.access_token)}
            return data
        except TokenError:
            raise serializers.ValidationError({"refresh": "Invalid refresh token."})


class RefreshTokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
