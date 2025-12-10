from django.urls import path
from event_handlers.controllers.sync_controller import PublicSyncController

app_name = "event_handlers"

urlpatterns = [
    path(
        "sync",
        PublicSyncController.as_view({"post":"sync_all_data"}),
        name="sync-all-data",
    ),
]
