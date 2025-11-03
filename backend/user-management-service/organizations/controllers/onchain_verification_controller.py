from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
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
