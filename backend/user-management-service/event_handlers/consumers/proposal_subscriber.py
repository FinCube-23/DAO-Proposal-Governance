# event_handlers/consumers/proposal_consumer.py
import json
import time
from typing import Dict, Callable
from django.conf import settings
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from event_handlers.utils.types import ResponseTransactionStatusDto, ProposalEventData
from organizations.services.onchain_verification_service import OnchainVerificationService

class ProposalSubscriber:
    def __init__(self):
        self.event_handlers: Dict[str, Callable[[ResponseTransactionStatusDto], None]] = {
            'ProposalCanceled': self.handle_proposal_updated,
            'ProposalExecuted': self.handle_proposal_updated,
            'ProposalAdded': self.handle_proposal_created,
        }

    # 📡 Event Listener from Audit Trail
    def start_listening(self):
        """Start listening for proposal events with reconnection logic"""
        while True:
            try:
                connection, channel = RabbitMQConnector.get_connection()
                
                # Mirror NestJS configuration exactly
                channel.exchange_declare(
                    exchange='proposal-update-exchange',
                    exchange_type='fanout',
                    durable=True
                )
                
                result = channel.queue_declare(
                    queue='user-management-service-queue',
                    durable=True,
                )
                
                channel.queue_bind(
                    exchange='proposal-update-exchange',
                    queue='user-management-service-queue',
                    routing_key=''  # Empty for fanout
                )
                
                channel.basic_consume(
                    queue='user-management-service-queue',
                    on_message_callback=self.process_message,
                    auto_ack=False,
                    consumer_tag='user-management-consumer'
                )
                
                print("\n" + "="*40)
                print(" [*] Proposal Consumer READY")
                print(f" [*] Queue: {result.method.queue}")
                print(f" [*] Waiting for blockchain events...")
                print("="*40 + "\n")
                
                channel.start_consuming()
                
            except KeyboardInterrupt:
                print("\n [⚠️] Consumer stopped by user")
                if 'connection' in locals() and connection.is_open:
                    connection.close()
                break
            except Exception as e:
                print(f" [⚠️] Connection error: {str(e)}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        """Process incoming blockchain events"""
        try:
            event: ResponseTransactionStatusDto = json.loads(body)
            print(f"\n [⚐] Received blockchain event (tx: {event['transactionHash'][:10]}...)")
            print(f" [ⓘ] Status: {event['web3Status']} | Block: {event['blockNumber']}")
            
            typename = event.get('data', {}).get('__typename')
            if not typename:
                print(" [⚠️] Missing __typename in event data")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
                
            print(f" [⚡] Event Type: {typename}")
            
            if typename in self.event_handlers:
                print(f" [⚙] Executing handler...")
                self.event_handlers[typename](event)
            else:
                print(f" [⚠️] No handler for {typename}")
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(" [✓] Processing complete")
            
        except json.JSONDecodeError:
            print(" [✘] Invalid JSON payload")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except KeyError as e:
            print(f" [✘] Missing required field: {str(e)}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            print(f" [✘] Processing failed: {str(e)}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    # ===== HANDLER IMPLEMENTATIONS =====
    def handle_proposal_updated(self, event: ResponseTransactionStatusDto):
        """Handle proposal updates (Canceled/Executed)"""
        data: ProposalEventData = event.get('data', {})
        print(f" [↻] Processing update for proposal {data.get('id')}")
        print(f" [✉] Message: {event['message']}")

    def handle_proposal_created(self, event: ResponseTransactionStatusDto):
        """Handle new proposal creation"""
        data: ProposalEventData = event.get('data', {})
        print(f" [🅝🅔🅦] New proposal created: {data.get('id')}")
        print(f" [▀▄▀] Block: {event['blockNumber']} | TX: {event['transactionHash'][:10]}...")

        # Prepare on-chain verification data (currently uses dummy data)
        onchainVerificationData = {
            "organization_id": event.get('organization_id', 3),  # Default to 3 if not provided
            "trx_hash": event['transactionHash'],
            "context": {
                "block_number": event['blockNumber'],
            },
            "proposer_wallet": event.get('proposer_wallet', "0x1234567890123456789012345678901234567890"),  # Default to dummy wallet if not provided
        }

        try:
            verification = OnchainVerificationService.create_onchain_verification(onchainVerificationData)
            print(f" [✔️] On-chain verification created: {verification.id}")
        except Exception as e:
            print(f" [✘] Failed to create on-chain verification: {str(e)}")