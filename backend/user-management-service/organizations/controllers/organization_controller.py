from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from organizations.models import Organization
from organizations.services.organization_service import OrganizationService
from organizations.serializers.organization_serializers import (
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    OrganizationListSerializer,
    OrganizationDetailSerializer,
    OrganizationResponseSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

class OrganizationListController(APIView):
    """
    Handle organization list operations: GET (all) and POST (create)
    """
    
    @extend_schema(
        request=OrganizationCreateSerializer,
        responses={
            201: OrganizationResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def post(self, request):
        """
        Handle creation of an organization.
        in -> name, email, type, address, legal_entity_identifier, organization_admin_id
        out -> id, name, email, type, address, legal_entity_identifier, organization_admin_id
        """
        serializer = OrganizationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            organization = OrganizationService.create_organization(serializer.validated_data)
            response_serializer = OrganizationResponseSerializer(organization)
            
            return Response({
                'status': 'success',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                description='Page number',
            ),
            OpenApiParameter(
                name='limit',
                type=OpenApiTypes.INT,
                description='Items per page',
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                description='Filter by organization status',
                enum=[choice[0] for choice in Organization.STATUS_CHOICES],
            ),
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                description='Filter active organizations',
            ),
            OpenApiParameter(
                name='type',
                type=OpenApiTypes.STR,
                description='Filter by organization type',
                enum=[choice[0] for choice in Organization.ORGANIZATION_TYPES],
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
    )
    def get(self, request):
        """
        Handle retrieval of all organizations.
        out -> id, name, email, type, address, legal_entity_identifier, status, organization_admin_id, organization_admin_name
        """
        try:
            organizations, pagination = OrganizationService.get_all_organizations(request.query_params)
            serializer = OrganizationListSerializer(organizations, many=True)
            return Response({
                'organizations': serializer.data,
                'pagination': pagination
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OrganizationDetailController(APIView):
    """
    Handle individual organization operations: GET (by ID), PATCH (update)
    """
    
    @extend_schema(
        responses={
            200: OrganizationDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def get(self, request, org_id):
        """
        Handle retrieval of a specific organization by ID.
        in -> org_id
        out -> org data, org_admin data, on_chain_verification data
        """
        try:
            organization = OrganizationService.get_organization_by_id(org_id)
            serializer = OrganizationDetailSerializer(organization, context={
                'request': request,
                'org_id': org_id
            })
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() 
                else status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        request=OrganizationUpdateSerializer,
        responses={
            200: OrganizationDetailSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def patch(self, request, org_id):
        """
        Handle update of a specific organization by ID.
        in -> org_id, email, address (only email and address can be updated)
        out -> id, name, email, type, address, legal_entity_identifier, status, organization_admin_id
        """
        try:
            # Get the organization for the serializer instance
            organization = OrganizationService.get_organization_by_id(org_id)
            
            serializer = OrganizationUpdateSerializer(
                instance=organization,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            
            updated_organization = OrganizationService.update_organization(
                org_id, 
                serializer.validated_data
            )
            
            response_serializer = OrganizationDetailSerializer(updated_organization)
            
            return Response({
                'status': 'success',
                'data': response_serializer.data
            })
            
        except Exception as e:
            error_status = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=error_status)