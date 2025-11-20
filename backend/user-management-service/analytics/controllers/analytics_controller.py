from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from logging_config import logger
from analytics.services.analytics_service import AnalyticsService
from analytics.serializers.analytics_serializer import StatsResponseSerializer

class ProtectedAnalyticsController(ViewSet):
    logger.set_context("ProtectedAnalyticsController")
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: StatsResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        summary="Get analytics data",
        description="Retrieve various analytics data for user management.",
    )
    def get_analytics_data(self, request):
        """
        Get analytics data.
        Retrieves and returns analytics data related to user management.
        """
        logger.log({"event": "Getting analytics data Started", "data": request.query_params})
        
        try:
            analytics_data = AnalyticsService.get_all_stats()
            serializer = StatsResponseSerializer(data=analytics_data)

            logger.log({"event": "Getting analytics data Success", "data": serializer.initial_data})
            return Response(
                serializer.initial_data,
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error({"event": "Getting analytics data Error", "data": request.query_params, "error": str(e)})
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )