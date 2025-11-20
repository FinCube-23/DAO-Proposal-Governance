from rest_framework import serializers
from organizations.models import OnchainVerification, Organization


class OnchainVerificationCreateSerializer(serializers.ModelSerializer):
    trx_hash = serializers.CharField(max_length=66, required=True)
    context = serializers.JSONField(required=True)
    proposer_wallet = serializers.CharField(max_length=42, required=True)
    organization_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = OnchainVerification
        fields = [
            "trx_hash",
            "context",
            "proposer_wallet",
            "organization_id",
        ]

    def validate_organization_id(self, value):
        try:
            Organization.objects.get(id=value)
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization does not exist")
        return value

    def validate_trx_hash(self, value):
        # Check if transaction hash already exists
        if OnchainVerification.objects.filter(trx_hash=value).exists():
            raise serializers.ValidationError("Transaction hash already exists")

        # Basic validation for Ethereum transaction hash format
        if not value.startswith("0x") or len(value) != 66:
            raise serializers.ValidationError("Invalid transaction hash format")
        return value

    def validate_proposer_wallet(self, value):
        # Basic validation for Ethereum wallet address format
        if not value.startswith("0x") or len(value) != 42:
            raise serializers.ValidationError("Invalid wallet address format")
        return value

    def validate(self, data):
        # Block restricted fields even if somehow passed
        restricted_fields = {"id", "created_at", "updated_at"}
        if restricted_fields.intersection(data.keys()):
            raise serializers.ValidationError("Attempted to modify restricted fields")

        # Validate proposer wallet matches organization admin's wallet
        organization_id = data.get("organization_id")
        proposer_wallet = data.get("proposer_wallet")

        if organization_id and proposer_wallet:
            try:
                organization = Organization.objects.get(id=organization_id)
                organization_admin = organization.organization_admin
                print("Admin => ")
                if not organization_admin.wallet_address:
                    raise serializers.ValidationError(
                        "Organization admin does not have a wallet address set"
                    )

                if organization_admin.wallet_address.lower() != proposer_wallet.lower():
                    raise serializers.ValidationError(
                        "Proposer wallet address must match the organization admin's wallet address"
                    )

            except Organization.DoesNotExist:
                # This will be caught by validate_organization_id, so we don't need to handle it here
                pass

        return data

    def create(self, validated_data):
        organization = Organization.objects.get(
            id=validated_data.pop("organization_id")
        )

        return OnchainVerification.objects.create(
            organization=organization, **validated_data
        )


class OnchainVerificationResponseSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(source="organization.id", read_only=True)
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )

    class Meta:
        model = OnchainVerification
        fields = [
            "id",
            "trx_hash",
            "onchain_id",
            "onchain_status",
            "context",
            "proposer_wallet",
            "organization_id",
            "organization_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OnchainVerificationListSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )

    class Meta:
        model = OnchainVerification
        fields = [
            "id",
            "trx_hash",
            "onchain_id",
            "onchain_status",
            "proposer_wallet",
            "context",
            "organization_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
