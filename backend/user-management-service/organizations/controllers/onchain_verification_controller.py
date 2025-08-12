from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from organizations.services.onchain_verification_service import OnchainVerificationService
from organizations.serializers.onchain_verification_serializers import (
    OnchainVerificationCreateSerializer,
    OnchainVerificationResponseSerializer,
    OnchainVerificationListSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

class OnchainVerificationController(APIView):
    
    @extend_schema(
        request=OnchainVerificationCreateSerializer,
        responses={
            201: OnchainVerificationResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def post(self, request):
        """
        Create a new on-chain verification.
        Creates an on-chain verification record for an organization.
        """
        serializer = OnchainVerificationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            verification = OnchainVerificationService.create_onchain_verification(
                serializer.validated_data
            )
            
            response_serializer = OnchainVerificationResponseSerializer(verification)
            
            return Response({
                'status': 'success',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class OnchainVerificationByOrganizationController(APIView):
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='org_id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Organization ID',
                required=True
            ),
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
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
    )
    def get(self, request, org_id):
        """
        Retrieve on-chain verifications by organization ID.
        Returns a paginated list of on-chain verifications for the specified organization.
        """
        try:
            verifications, pagination = OnchainVerificationService.get_verifications_by_organization(
                org_id, request.query_params
            )
            
            serializer = OnchainVerificationListSerializer(verifications, many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'verifications': serializer.data,
                    'pagination': pagination
                }
            })
            
        except Exception as e:
            error_status = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() or "does not exist" in str(e).lower() else status.HTTP_400_BAD_REQUEST
            
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=error_status)