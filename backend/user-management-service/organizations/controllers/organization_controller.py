from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from organizations.models import Organization
from organizations.services.organization_service import OrganizationService
from organizations.serializers.organization_serializers import (
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    OrganizationListSerializer,
    OrganizationDetailSerializer,
    OrganizationResponseSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated


class ProtectedOrganizationController(ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    """
    Handle organization list operations: GET (all) and POST (create)
    """

    @extend_schema(
        request=OrganizationCreateSerializer,
        responses={
            201: OrganizationResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Create organization",
        description="Create a new organization with proper validation.",
    )
    def create(self, request):
        """
        Create a new organization.
        in -> name, email, type, address, legal_entity_identifier, organization_admin_id
        out -> id, name, email, type, address, legal_entity_identifier, organization_admin_id
        """
        serializer = OrganizationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            organization = OrganizationService.create_organization(
                serializer.validated_data
            )
            response_serializer = OrganizationResponseSerializer(organization)

            return Response(
                {"status": "success", "data": response_serializer.data},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
                description="Page number",
            ),
            OpenApiParameter(
                name="limit",
                type=OpenApiTypes.INT,
                description="Items per page",
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                description="Filter by organization status",
                enum=[choice[0] for choice in Organization.STATUS_CHOICES],
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                description="Filter active organizations",
            ),
            OpenApiParameter(
                name="type",
                type=OpenApiTypes.STR,
                description="Filter by organization type",
                enum=[choice[0] for choice in Organization.ORGANIZATION_TYPES],
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
        summary="List all organizations",
        description="Retrieve a paginated list of all organizations with optional filtering.",
    )
    def get_list(self, request):
        """
        Retrieve all organizations with pagination and filtering.
        out -> id, name, email, type, address, legal_entity_identifier, status, organization_admin_id, organization_admin_name
        """
        try:
            organizations, pagination = OrganizationService.get_all_organizations(
                request.query_params
            )
            serializer = OrganizationListSerializer(organizations, many=True)
            return Response(
                {"organizations": serializer.data, "pagination": pagination}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="org_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Organization ID",
                required=True,
            ),
        ],
        responses={
            200: OrganizationDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Get organization details",
        description="Retrieve detailed information about a specific organization by ID.",
    )
    def get_by_id(self, request, org_id):
        """
        Retrieve a specific organization by ID with detailed information.
        in -> org_id
        out -> org data, org_admin data, on_chain_verification data
        """
        try:
            organization = OrganizationService.get_organization_by_id(org_id)
            serializer = OrganizationDetailSerializer(
                organization, context={"request": request, "org_id": org_id}
            )
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=(
                    status.HTTP_404_NOT_FOUND
                    if "not found" in str(e).lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="org_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Organization ID",
                required=True,
            ),
        ],
        request=OrganizationUpdateSerializer,
        responses={
            200: OrganizationDetailSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Update organization",
        description="Update specific fields of an organization (email and address only).",
    )
    def update_organization_info(self, request, org_id):
        """
        Update a specific organization by ID.
        in -> org_id, email, address (only email and address can be updated)
        out -> id, name, email, type, address, legal_entity_identifier, status, organization_admin_id
        """
        try:
            # Get the organization for the serializer instance
            organization = OrganizationService.get_organization_by_id(org_id)

            if not organization.organization_admin_id == request.user.id:
                return Response(
                    {
                        "status": "error",
                        "message": "You are not authorized to update this organization.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = OrganizationUpdateSerializer(
                instance=organization, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)

            updated_organization = OrganizationService.update_organization(
                org_id, serializer.validated_data
            )

            response_serializer = OrganizationDetailSerializer(updated_organization)

            return Response({"status": "success", "data": response_serializer.data})

        except Exception as e:
            error_status = (
                status.HTTP_404_NOT_FOUND
                if "not found" in str(e).lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"status": "error", "message": str(e)}, status=error_status)
