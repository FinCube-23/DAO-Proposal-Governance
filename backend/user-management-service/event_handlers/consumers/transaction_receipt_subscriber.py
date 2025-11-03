import json
import time
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from organizations.services.onchain_verification_service import OnchainVerificationService
from organizations.serializers.onchain_verification_serializers import (
    OnchainVerificationCreateSerializer
)
from logging_config import logger

"""
This is responsible for Listening to Exchange from Frontend.
"""
class TransactionReceiptSubscriber:
    logger.set_context("TransactionReceiptSubscriber")
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

                logger.log("Transaction Receipt Consumer READY")
                logger.log(f"Queue: {result.method.queue}")
                logger.log(f"Exchange: exchange.transaction-receipt.fanout")
                logger.log("Waiting for transaction receipt events...")

                channel.start_consuming()
                
            except KeyboardInterrupt:
                print("\n [⚠️] Transaction Receipt Consumer stopped by user")
                logger.log("Transaction Receipt Consumer stopped by user")
                if 'connection' in locals() and connection.is_open:
                    connection.close()
                break
            except Exception as e:
                logger.log(f"Connection error: {str(e)}")
                print(f" [⚠️] Connection error: {str(e)}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        """Process incoming transaction receipt events"""
        try:
            event = json.loads(body)
            print("[$$$$$$$] Event is " , event)
            print(f"\n [📧] Received transaction receipt event")
            print(f" [ⓘ] Timestamp: {event.get('timestamp', 'N/A')}")
            print(f" [ⓘ] Method: {event.get('method', 'N/A')}")
            print(f" [ⓘ] Path: {event.get('path', 'N/A')}")

            logger.log("Received transaction receipt event")
            logger.log(f"Timestamp: {event.get('timestamp', 'N/A')}")
            logger.log(f"Method: {event.get('method', 'N/A')}")
            logger.log(f"Path: {event.get('path', 'N/A')}")
            
            onChainData = event.get('onChainData', {})
            print(f" [ⓘ] Transaction Hash: {onChainData.get('transactionHash', 'N/A')}")
            print(f" [ⓘ] Signed By: {onChainData.get('signedBy', 'N/A')}")
            print(f" [ⓘ] Context: {onChainData.get('context', 'N/A')}")

            logger.log(f"Transaction Hash: {onChainData.get('transactionHash', 'N/A')}")
            logger.log(f"Signed By: {onChainData.get('signedBy', 'N/A')}")
            logger.log(f"Context: {onChainData.get('context', 'N/A')}")
            
            # Always use transaction_receipt handler
            print(f" [⚡] Event Type: transaction_receipt")
            print(f" [⚙] Executing handler...")

            logger.log("Executing handler...")
            self.event_handlers['transaction_receipt'](event)
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(" [✓] Transaction receipt processing complete")
            logger.log("Transaction receipt processing complete")
            
        except json.JSONDecodeError:
            print(" [✘] Invalid JSON payload")
            logger.log("Invalid JSON payload")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            print(f" [✘] Processing failed: {str(e)}")
            logger.log(f"Processing failed: {str(e)}")
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
        
        # Parse context from JSON string
        context_str = onChainData.get("context")
        
        # ✅ Parse the JSON string to dictionary
        try:
            if isinstance(context_str, str):
                context = json.loads(context_str)
            else:
                context = context_str  # Already a dict (shouldn't happen, but safe)
        except (json.JSONDecodeError, TypeError) as e:
            print(f" [✘] Failed to parse context: {str(e)}")
            logger.log(f"Failed to parse context: {str(e)}")
            raise ValueError("Invalid context format")
        
        
        # Check proposal type
        proposal_type = context.get("proposalType")
        if proposal_type != 0 and proposal_type != "membership":  
            print(f" [⏭️] Skipping non-membership proposal (type: {proposal_type})")
            logger.log(f"Skipping non-membership proposal (type: {proposal_type})")
            return

        
        print(f" [💰] {json.dumps(log_message)}")
        logger.log(f" {json.dumps(log_message)}")
        # Extract organizationId from parsed context
        organization_id = context.get("organizationId")
        if not organization_id:
            print(f" [✘] Missing organization_id in context")
            logger.log(f"Missing organization_id in context")
            raise ValueError("organization_id is required in context")

        
        # Prepare verification data
        verification_data = {
            "trx_hash": onChainData.get("transactionHash"),
            "proposer_wallet": onChainData.get("signedBy"),
            "context": context,  # Use parsed context dict
            "organization_id": organization_id,  # Extract from context
        }

        
        serializer = OnchainVerificationCreateSerializer(data=verification_data)

        if not serializer.is_valid():
            print(f" [✘] Validation error: {serializer.errors}")
            logger.log(f"Validation error: {serializer.errors}")
            raise ValueError(serializer.errors)   # will trigger nack

        validated_data = serializer.validated_data

        try:
            obj = OnchainVerificationService.create_onchain_verification(validated_data)
            print(f" [*] OnchainVerification created: {obj.id}")
            logger.log(f"OnchainVerification created: {obj.id}")
        except Exception as e:
            print(f" [✘] Failed to create OnchainVerification: {str(e)}")
            logger.log(f"Failed to create OnchainVerification: {str(e)}")


        # TODO: Implement transaction receipt processing logic
        # - Log transaction details
        # - Update user transaction history
        # - Generate receipt document