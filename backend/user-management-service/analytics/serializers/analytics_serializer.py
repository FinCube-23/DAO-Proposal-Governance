from rest_framework import serializers


class UserCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    banned = serializers.IntegerField()
    active = serializers.IntegerField()


class OrganizationCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    banned = serializers.IntegerField()
    active = serializers.IntegerField()


class OnchainVerificationCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    register = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class StatsResponseSerializer(serializers.Serializer):
    users = UserCountSerializer()
    organizations = OrganizationCountSerializer()
    onchain_verifications = OnchainVerificationCountSerializer()