# event_handlers/consumers/transaction_receipt_subscriber.py
import json
import time
from typing import Dict, Callable
from django.conf import settings
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from organizations.services.onchain_verification_service import OnchainVerificationService
from organizations.serializers.onchain_verification_serializers import (
    OnchainVerificationCreateSerializer
)

class TransactionReceiptSubscriber:
    def __init__(self):
        self.event_handlers = {
            'transaction_receipt': self.handle_transaction_receipt,
        }

    def start_listening(self):
        """Start listening for transaction receipt events with reconnection logic"""
        while True:
            try:
                connection, channel = RabbitMQConnector.get_connection()
                
                # Declare the transaction receipt exchange
                channel.exchange_declare(
                    exchange='exchange.transaction-receipt.fanout',
                    exchange_type='fanout',
                    durable=True
                )
                
                # Declare dedicated queue for user management service
                result = channel.queue_declare(
                    queue='user-management-transaction-receipt-queue',
                    durable=True,
                )
                
                # Bind queue to exchange
                channel.queue_bind(
                    exchange='exchange.transaction-receipt.fanout',
                    queue='user-management-transaction-receipt-queue',
                    routing_key=''  # Empty for fanout
                )
                
                channel.basic_consume(
                    queue='user-management-transaction-receipt-queue',
                    on_message_callback=self.process_message,
                    auto_ack=False,
                    consumer_tag='user-management-transaction-receipt-consumer'
                )
                
                print("\n" + "="*50)
                print(" [*] Transaction Receipt Consumer READY")
                print(f" [*] Queue: {result.method.queue}")
                print(f" [*] Exchange: exchange.transaction-receipt.fanout")
                print(f" [*] Waiting for transaction receipt events...")
                print("="*50 + "\n")
                
                channel.start_consuming()
                
            except KeyboardInterrupt:
                print("\n [⚠️] Transaction Receipt Consumer stopped by user")
                if 'connection' in locals() and connection.is_open:
                    connection.close()
                break
            except Exception as e:
                print(f" [⚠️] Connection error: {str(e)}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        """Process incoming transaction receipt events"""
        try:
            event = json.loads(body)
            print(f"\n [📧] Received transaction receipt event")
            print(f" [ⓘ] Timestamp: {event.get('timestamp', 'N/A')}")
            print(f" [ⓘ] Method: {event.get('method', 'N/A')}")
            print(f" [ⓘ] Path: {event.get('path', 'N/A')}")
            
            onChainData = event.get('onChainData', {})
            print(f" [ⓘ] Transaction Hash: {onChainData.get('transactionHash', 'N/A')}")
            print(f" [ⓘ] Signed By: {onChainData.get('signedBy', 'N/A')}")
            print(f" [ⓘ] Context: {onChainData.get('context', 'N/A')}")
            
            # Always use transaction_receipt handler
            print(f" [⚡] Event Type: transaction_receipt")
            print(f" [⚙] Executing handler...")
            self.event_handlers['transaction_receipt'](event)
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(" [✓] Transaction receipt processing complete")
            
        except json.JSONDecodeError:
            print(" [✘] Invalid JSON payload")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            print(f" [✘] Processing failed: {str(e)}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    # ===== HANDLER IMPLEMENTATIONS =====
    def handle_transaction_receipt(self, event):
        """Handle transaction receipts from Kong API"""
        onChainData = event.get('onChainData', {})
        trxHash = onChainData.get('transactionHash')
        
        # Log the specific message format as requested
        log_message = {
            'message': 'Triggering transaction hash from the from Kong API as on-chain referance',
            'trxHash': trxHash
        }
        
        print(f" [💰] {json.dumps(log_message)}")
        
        
        
        # Currently there are mismatch in variable names, that's why used this for temp patch-up.
        verification_data={
            "trx_hash"        : onChainData.get("transactionHash"),      # rename
            "proposer_wallet" : onChainData.get("signedBy"),             # rename
            "context"         : onChainData.get("context", {}),          # keep as-is
            "organization_id" : onChainData.get("organizationId", 5), # hard-coded
        }
        serializer=OnchainVerificationCreateSerializer(data=verification_data)

        if not serializer.is_valid():
            print(f" [✘] Validation error: {serializer.errors}")
            raise ValueError(serializer.errors)   # will trigger nack

        validated_data = serializer.validated_data

        try:
            obj=OnchainVerificationService.create_onchain_verification(validated_data)
            print(f" [*] OnchainVerification created: {obj.id}")
        except Exception as e:
            print(f" [✘] Failed to create OnchainVerification: {str(e)}")


        # TODO: Implement transaction receipt processing logic
        # - Log transaction details
        # - Update user transaction history
        # - Generate receipt document