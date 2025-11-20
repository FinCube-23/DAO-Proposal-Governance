from django.urls import path
from analytics.controllers import ProtectedAnalyticsController

app_name = "analytics"  # Namespace

urlpatterns = [
    path(
        "/analytics/stats", ProtectedAnalyticsController.as_view({"get": "get_analytics_data"}), name="analytics-stats"
    )
]
