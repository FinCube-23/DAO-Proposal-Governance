from rest_framework import serializers
from organizations.models import OrganizationUser, Organization
from users.models import User
from typing import Optional
from drf_spectacular.utils import extend_schema_field


class OrganizationUserCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True, required=True)
    organization_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = OrganizationUser
        fields = ["user_id", "organization_id"]

    def validate_user_id(self, value):
        try:
            user = User.objects.get(id=value)
            if not user.is_active:
                raise serializers.ValidationError(
                    "User is inactive and cannot be added to an organization"
                )
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return value

    def validate_organization_id(self, value):
        try:
            organization = Organization.objects.get(id=value)
            
            # Allow if organization is active (regardless of member count)
            if organization.is_active:
                return value
                
            # For inactive organizations, only allow if it's the first member
            member_count = OrganizationUser.objects.filter(organization=organization).count()
            print(f"Member count for organization {organization.id}: {member_count}")
            if member_count > 0:
                raise serializers.ValidationError(
                    "Organization is inactive and cannot accept new members"
                )
                
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization does not exist")
        
        return value

    def validate(self, data):
        # Check if user is already a member of this organization
        if OrganizationUser.objects.filter(
            user_id=data["user_id"], organization_id=data["organization_id"]
        ).exists():
            raise serializers.ValidationError(
                "User is already a member of this organization"
            )

        # Block restricted fields even if somehow passed
        restricted_fields = {"id", "created_at"}
        if restricted_fields.intersection(data.keys()):
            raise serializers.ValidationError("Attempted to modify restricted fields")

        return data

    def create(self, validated_data):
        user = User.objects.get(id=validated_data["user_id"])
        organization = Organization.objects.get(id=validated_data["organization_id"])

        return OrganizationUser.objects.create(user=user, organization=organization)


class OrganizationUserResponseSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    organization_id = serializers.IntegerField(source="organization.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )

    class Meta:
        model = OrganizationUser
        fields = [
            "id",
            "user_id",
            "user_email",
            "user_name",
            "organization_id",
            "organization_name",
            "created_at",
        ]
        read_only_fields = fields

    @extend_schema_field(str)
    def get_user_name(self, obj) -> Optional[str]:
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name if full_name else None
        return None
