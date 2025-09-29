import os
import threading
from django.apps import AppConfig
from django.conf import settings
from .consumers import jwt_consumer

class EventHandlersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'event_handlers'

    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':  # Prevent duplicate runs
            from .consumers.proposal_subscriber import ProposalSubscriber
            from .consumers.transaction_receipt_subscriber import TransactionReceiptSubscriber
            
            # Start consumers in separate threads
            message_thread = threading.Thread(
                target=jwt_consumer.start_jwt_consumer,
                daemon=True,
                name='jwt-consumer'
            )
            
            event_thread = threading.Thread(
                target=ProposalSubscriber().start_listening,
                daemon=True,
                name='proposal-subscriber'
            )
            
            transaction_receipt_thread = threading.Thread(
                target=TransactionReceiptSubscriber().start_listening,
                daemon=True,
                name='transaction-receipt-subscriber'
            )
            
            message_thread.start()
            event_thread.start()
            transaction_receipt_thread.start()