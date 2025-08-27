# event_handlers/consumers/proposal_consumer.py
import json
import time
from typing import Dict, Callable
from django.conf import settings
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from event_handlers.utils.types import ResponseTransactionStatusDto, ProposalEventData
from organizations.services.onchain_verification_service import OnchainVerificationService
from organizations.services.organization_service import OrganizationService

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
        data = event.get('data', {})
        event_type = data.get('__typename')
        onchain_id = data.get('proposalId')
        if not event_type:
            print(" [!] Missing event type in event data")
            return
        if not onchain_id:
            print(" [!] Missing on-chain ID in event data")
            return

        try:
            if event_type == 'ProposalExecuted':
                print("Redirecting the AUDIT-TRAIL-SERVICE event call to Execute Proposal")
                OnchainVerificationService.update_verification_status_by_onchain_id(onchain_id, 'approved')
            elif event_type == 'ProposalCanceled':
                print("Redirecting the AUDIT-TRAIL-SERVICE event call to Cancel Proposal")
                OnchainVerificationService.update_verification_status_by_onchain_id(onchain_id, 'cancelled')
            else:
                print(f" [!] Unknown proposal event type: {event_type}")
        except Exception as e:
            print(f" [✘] Failed to update verification status: {str(e)}")

    def handle_proposal_created(self, event: ResponseTransactionStatusDto):
        """Handle new proposal creation"""
        data = event.get('data', {})
        proposer_wallet = data.get('proposedWallet').lower()
        trx_hash = event.get('transactionHash')
        onchain_id = data.get('proposalId')

        print(f"Received a proposal transaction update in event pattern - hash: {trx_hash[:10]}...")
        print(f"On-Chain Proposal ID: {onchain_id} | Proposer Wallet: {proposer_wallet}")
        try:
            # TODO: Get the verification by proposer_wallet not by trx_hash. If there are multiple verifications found, take the latest one.
            OnchainVerificationService.handle_proposal_creation(proposer_wallet, onchain_id)
        except Exception as e:
            print(f"Invalid proposal object received: {str(e)}")