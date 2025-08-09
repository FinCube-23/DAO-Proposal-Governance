# users/serializers/registration.py
from rest_framework import serializers
from organizations.models import Organization
from users.models import User
from typing import Optional 
from drf_spectacular.utils import extend_schema_field, OpenApiExample
from phonenumber_field.serializerfields import PhoneNumberField

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'email', 
            'first_name',
            'last_name',
            'contact_number',
            'password',
            'password_confirm'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},  # Added this
            'contact_number': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # Validate contact number format if needed
        if not data['contact_number'].startswith('+'):
            raise serializers.ValidationError(
                {"contact_number": "Must include country code (e.g. +880)"}
            )
            
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserResponseSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    contact_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'contact_number',
            'date_joined'
        ]
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
        fields = ['id', 'email', 'first_name', 'last_name', 
                 'is_active', 'is_staff']
        read_only_fields = fields

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 
                'contact_number', 'is_active', 'is_staff']
        read_only_fields = ['id']

    # Add custom validation if needed
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

class WalletUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['wallet_address']
        extra_kwargs = {
            'wallet_address': {
                'required': True,
                'allow_null': False
            }
        }

    def validate_wallet_address(self, value):
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError(
                "Invalid wallet address format. Must start with 0x and be 42 characters long."
            )
        return value

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'email',
            'type',
            'address',
            'legal_entity_identifier',
            'status'
        ]
        extra_kwargs = {
            'name': {'required': True},
            'email': {'required': True}
        }

