from django.apps import AppConfig
from django.conf import settings


class EventHandlersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'event_handlers'


    def ready(self):
        from .consumers import start_consumers
        start_consumers()