from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from organizations.models import OnchainVerification
from organizations.services.onchain_verification_service import (
    OnchainVerificationService,
)
from organizations.serializers.onchain_verification_serializers import (
    OnchainVerificationListSerializer,
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from logging_config import logger

class ProtectedOnchainVerificationController(ViewSet):
    logger.set_context("ProtectedOnchainVerificationController")
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

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
                name="onchain_status",
                type=OpenApiTypes.STR,
                description="Filter by on-chain verification status",
                enum=[choice[0] for choice in OnchainVerification.ONCHAIN_STATUS_CHOICES],
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search by organization name, transaction hash, proposer wallet, or on-chain ID",
            ),
            OpenApiParameter(
                name="sort_by",
                type=OpenApiTypes.STR,
                description="Sort by field",
                enum=['id', 'trx_hash', 'onchain_id', 'onchain_status', 'proposer_wallet', 'created_at', 'updated_at'],
            ),
            OpenApiParameter(
                name="order",
                type=OpenApiTypes.STR,
                description="Sort order",
                enum=['asc', 'desc'],
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
        summary="List all on-chain verifications",
        description="Retrieve a paginated list of all on-chain verifications with optional filtering, search, and sorting.",
    )
    def get_all_verifications(self, request):
        """
        Retrieve all on-chain verifications with pagination, filtering, search, and sorting.
        """
        logger.log({"event": "Getting all on-chain verifications Started", "data": request.query_params})
        try:
            verifications, pagination = OnchainVerificationService.get_all_verifications(
                request.query_params
            )
            serializer = OnchainVerificationListSerializer(verifications, many=True)
            logger.log({"event": "Getting all on-chain verifications Success", "data": serializer.data})
            return Response({
                "verifications": serializer.data,
                "pagination": pagination
            })
        except Exception as e:
            logger.error({"event": "Getting all on-chain verifications Error", "data": request.query_params, "error": str(e)})
            if "invalid" in str(e).lower():
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif "not found" in str(e).lower() or "does not exist" in str(e).lower():
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_404_NOT_FOUND
                )
            else:
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="verification_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="On-chain verification ID",
                required=True,
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Get on-chain verification by ID",
        description="Retrieve a single on-chain verification by its ID.",
    )        
    def get_verification_by_id(self, request, verification_id):
        """
        Retrieve a single on-chain verification by its ID.
        """
        logger.log({"event": "Getting on-chain verification by ID Started", "verification_id": verification_id})
        try:
            verification = OnchainVerificationService.get_verification_by_id(verification_id)
            serializer = OnchainVerificationListSerializer(verification)
            logger.log({"event": "Getting on-chain verification by ID Success", "data": serializer.data})
            return Response(serializer.data)
        except Exception as e:
            logger.error({"event": "Getting on-chain verification by ID Error", "verification_id": verification_id, "error": str(e)})
            if "not found" in str(e).lower() or "does not exist" in str(e).lower():
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_404_NOT_FOUND
                )
            elif "invalid" in str(e).lower():
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {"status": "error", "message": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Get on-chain verifications by organization",
        description="Retrieve a paginated list of on-chain verifications for a specific organization.",
    )
    def get_onchain_verifications_by_organization(self, request, org_id):
        """
        Retrieve on-chain verifications by organization ID.
        Returns a paginated list of on-chain verifications for the specified organization.
        """
        logger.log({"event": "Getting on-chain verifications by organization Started", "org_id": org_id})
        try:
            verifications, pagination = (
                OnchainVerificationService.get_verifications_by_organization(
                    org_id, request.query_params
                )
            )

            serializer = OnchainVerificationListSerializer(verifications, many=True)
            logger.log({"event": "Getting on-chain verifications by organization Success", "data": serializer.data})
            return Response(
                {
                    "status": "success",
                    "data": {
                        "verifications": serializer.data,
                        "pagination": pagination,
                    },
                }
            )

        except Exception as e:
            logger.error({"event": "Getting on-chain verifications by organization Error", "org_id": org_id, "error": str(e)})
            error_status = (
                status.HTTP_404_NOT_FOUND
                if "not found" in str(e).lower() or "does not exist" in str(e).lower()
                else status.HTTP_400_BAD_REQUEST
            )

            return Response({"status": "error", "message": str(e)}, status=error_status)