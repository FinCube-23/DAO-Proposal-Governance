from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from organizations.services.organization_user_service import OrganizationUserService
from organizations.serializers.organization_user_serializers import (
    OrganizationUserCreateSerializer,
    OrganizationUserResponseSerializer
)
from drf_spectacular.utils import extend_schema

class OrganizationUserController(ViewSet):
    
    @extend_schema(
        request=OrganizationUserCreateSerializer,
        responses={
            201: OrganizationUserResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        summary="Add user to organization",
        description="Create a new organization user membership by adding a user to an organization."
    )
    def add_user_to_organization(self, request):
        """
        Add a user to an organization.
        Creates a new organization user membership with proper validation.
        """
        serializer = OrganizationUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            organization_user = OrganizationUserService.create_organization_user(
                serializer.validated_data
            )
            
            response_serializer = OrganizationUserResponseSerializer(organization_user)
            
            return Response({
                'status': 'success',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)