from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from organizations.models import Organization
from users.models import User
from typing import Optional
from drf_spectacular.utils import extend_schema_field
from logging_config import logger


class RestrictedFieldsMixin:
    """Mixin to block modifications to restricted fields."""

    restricted_fields = set()

    def validate(self, data):
        if self.restricted_fields.intersection(data.keys()):
            raise serializers.ValidationError("Attempted to modify restricted fields")
        return super().validate(data)


class OrganizationCreateSerializer(RestrictedFieldsMixin, serializers.ModelSerializer):
    organization_admin_id = serializers.IntegerField(write_only=True, required=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Organization.objects.all())]
    )

    restricted_fields = {"id", "is_active", "status", "created_at", "updated_at"}

    class Meta:
        model = Organization
        fields = [
            "name",
            "email",
            "type",
            "address",
            "legal_entity_identifier",
            "organization_admin_id",
        ]
        extra_kwargs = {
            "name": {"required": True},
            "type": {"required": True},
            "address": {"required": True},
            "legal_entity_identifier": {"required": False},
        }

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Organization name must be at least 2 characters long"
            )
        if Organization.objects.filter(name=value.strip()).exists():
            raise serializers.ValidationError(
                "An organization with this name already exists"
            )
        return value.strip()

    def validate_email(self, value):
        if Organization.objects.filter(email=value.strip()).exists():
            raise serializers.ValidationError(
                "An organization with this email already exists"
            )
        return value.strip()

    def validate_type(self, value):
        valid_types = [choice[0] for choice in Organization.ORGANIZATION_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid organization type. Must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate_organization_admin_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Admin user does not exist")
        return value

    def create(self, validated_data):
        organization_admin_id = validated_data.pop("organization_admin_id")
        organization_admin = User.objects.get(id=organization_admin_id)
        return Organization.objects.create(
            organization_admin=organization_admin, **validated_data
        )


class OrganizationUpdateSerializer(RestrictedFieldsMixin, serializers.ModelSerializer):
    email = serializers.EmailField(required=False)

    restricted_fields = {
        "id",
        "name",
        "type",
        "is_active",
        "legal_entity_identifier",
        "status",
        "organization_admin",
        "organization_admin_id",
        "created_at",
        "updated_at",
    }

    class Meta:
        model = Organization
        fields = ["email", "address"]

    def validate_email(self, value):
        # Ensure email uniqueness excluding current instance
        if (
            self.instance
            and Organization.objects.filter(email=value)
            .exclude(pk=self.instance.pk)
            .exists()
        ):
            raise serializers.ValidationError(
                "An organization with this email already exists"
            )
        return value.lower()

    def validate(self, data):
        data = super().validate(data)
        if not any(value not in (None, "") for value in data.values()):
            raise serializers.ValidationError(
                "At least one non-empty field must be provided for update"
            )
        return data


class OrganizationListSerializer(serializers.ModelSerializer):
    offchain_status=serializers.CharField(source="status",read_only=True)
    organization_admin=serializers.SerializerMethodField()
    onchain_status=serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "email",
            "type",
            "address",
            "legal_entity_identifier",
            "offchain_status",
            "organization_admin",
            "onchain_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    
    @extend_schema_field(dict)
    def get_organization_admin(self,obj)->Optional[dict]:
        try:
            if obj.organization_admin:
                return {
                    "id": obj.organization_admin.id,
                    "email": obj.organization_admin.email,
                    "full_name": f"{obj.organization_admin.first_name} {obj.organization_admin.last_name}".strip(),
                    "status": obj.organization_admin.status,
                    "phone_number": (
                        str(obj.organization_admin.contact_number)
                        if obj.organization_admin.contact_number
                        else None
                    ),
                    "wallet_address": obj.organization_admin.wallet_address,
                }
            return None
        except Exception as e:
            logger.error({"event": "Error getting organization admin in list serializer", "error": str(e)})
            return None
        
    @extend_schema_field(str)
    def get_onchain_status(self,obj)->Optional[str]:
        try:
            latest_verification=obj.onchain_verifications.order_by("-created_at").first()
            if latest_verification:
                return latest_verification.onchain_status
            return None
        except Exception as e:
            logger.error(
                {"event": "Error getting onchain data in list serializer", "error": str(e)},
                contextValue="OrganizationListSerializer"
            )
            return None


class OrganizationDetailSerializer(serializers.ModelSerializer):
    offchain_status=serializers.CharField(source="status",read_only=True)
    organization_admin = serializers.SerializerMethodField()
    onchain_status = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "email",
            "type",
            "address",
            "legal_entity_identifier",
            "offchain_status",
            "is_active",
            "organization_admin",
            "onchain_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    @extend_schema_field(dict)
    def get_organization_admin(self, obj) -> Optional[dict]:
        try:
            if obj.organization_admin:
                return {
                    "id": obj.organization_admin.id,
                    "email": obj.organization_admin.email,
                    "full_name": f"{obj.organization_admin.first_name} {obj.organization_admin.last_name}".strip(),
                    "status": obj.organization_admin.status,
                    "phone_number": (
                        str(obj.organization_admin.contact_number)
                        if obj.organization_admin.contact_number
                        else None
                    ),
                    "wallet_address": obj.organization_admin.wallet_address,
                }
            return None
        except Exception as e:
            logger.error(
                {"event": "Error getting organization admin in detail serializer", "error": str(e)},
                contextValue="OrganizationDetailSerializer"
            )
            return None

    @extend_schema_field(str)
    def get_onchain_status(self,obj)->Optional[str]:
        try:
            latest_verification=obj.onchain_verifications.order_by("-created_at").first()
            if latest_verification:
                return latest_verification.onchain_status
            return None
        except Exception as e:
            logger.error(
                {"event": "Error getting onchain data in detail serializer", "error": str(e)},
                contextValue="OrganizationDetailSerializer"
            )
            return None


class OrganizationResponseSerializer(serializers.ModelSerializer):
    organization_admin_id = serializers.IntegerField(
        source="organization_admin.id", read_only=True
    )

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "email",
            "type",
            "address",
            "legal_entity_identifier",
            "organization_admin_id",
        ]
        read_only_fields = fields


class OrganizationStatusChangeSerializer(serializers.Serializer):
    organization_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=True,
        allow_empty=False,
        help_text="List of organization IDs to update"
    )
    status = serializers.ChoiceField(
        choices=Organization.STATUS_CHOICES,
        required=True,
        help_text="New status to set"
    )
    
    def validate_organization_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one organization ID is required")
        # Remove duplicates
        return list(set(value))
