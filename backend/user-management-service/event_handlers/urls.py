from django.urls import path
from event_handlers.controllers.sync_controller import sync_all_data

app_name = "event_handlers"  # Namespace

urlpatterns = [
    path(
        "/sync",
        sync_all_data,
        name="sync-all-data",
    ),
]