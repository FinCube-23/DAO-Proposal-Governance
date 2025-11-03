import json
import time
from typing import Dict, Callable
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from organizations.services.onchain_verification_service import OnchainVerificationService
from logging_config import logger

"""
This is responsible for Listening to Exchange from Audit Trail Service.
"""
class ProposalSubscriber:
    logger.set_context("ProposalSubscriber")

    def __init__(self):
        self.event_handlers: Dict[str, Callable] = {
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
                    exchange='exchange.web3_event_hub.fanout',
                    exchange_type='fanout',
                    durable=True
                )

                result = channel.queue_declare(
                    queue='user_management_service.web3_events.queue',
                    durable=True,
                )

                channel.queue_bind(
                    exchange='exchange.web3_event_hub.fanout',
                    queue='user_management_service.web3_events.queue',
                    routing_key=''  # Empty for fanout
                )

                channel.basic_consume(
                    queue='user_management_service.web3_events.queue',
                    on_message_callback=self.process_message,
                    auto_ack=False,
                    consumer_tag='user-management-consumer'
                )

                print("\n" + "="*40)
                print(" [*] Proposal Consumer READY")
                print(f" [*] Queue: {result.method.queue}")
                print(f" [*] Waiting for blockchain events...")
                print("="*40 + "\n")

                logger.log("Proposal Consumer READY")
                logger.log(f"Queue: {result.method.queue}")
                logger.log("Waiting for blockchain events...")

                channel.start_consuming()

            except KeyboardInterrupt:
                print("\n [⚠️] Consumer stopped by user")
                logger.log("Consumer stopped by user")
                if 'connection' in locals() and connection.is_open:
                    connection.close()
                break
            except Exception as e:
                print(f" [⚠️] Connection error: {str(e)}")
                logger.log(f"Connection error: {str(e)}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        """Process incoming blockchain events"""
        try:
            event = json.loads(body)

            # Extract onChainData
            onChainData = event.get('onChainData', {})
            trxHash = onChainData.get('transactionHash', 'N/A')

            print(f"\n [⚐] Received blockchain event")
            print(f" [ⓘ] Transaction Hash: {trxHash}")
            print(f" [ⓘ] Signed By: {onChainData.get('signedBy', 'N/A')}")

            logger.log("Received blockchain event")
            logger.log(f"Transaction Hash: {trxHash}")
            logger.log(f"Signed By: {onChainData.get('signedBy', 'N/A')}")

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


            # Extract typename from context
            typename = context.get('__typename')
            if not typename:
                print(" [⚠️] Missing __typename in context")
                logger.log("Missing __typename in context")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            print(f" [⚡] Event Type: {typename}")
            logger.log(f"Event Type: {typename}")

            if typename in self.event_handlers:
                print(f" [⚙] Executing handler...")
                logger.log("Executing handler...")
                self.event_handlers[typename](event, context)
            else:
                print(f" [⚠️] No handler for {typename}")
                logger.log(f"No handler for {typename}")

            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(" [✓] Processing complete")
            logger.log("Processing complete")

        except json.JSONDecodeError:
            print(" [✘] Invalid JSON payload")
            logger.log("Invalid JSON payload")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except KeyError as e:
            print(f" [✘] Missing required field: {str(e)}")
            logger.log(f"Missing required field: {str(e)}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            print(f" [✘] Processing failed: {str(e)}")
            logger.log(f"Processing failed: {str(e)}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


    # ===== HANDLER IMPLEMENTATIONS =====
    def handle_proposal_updated(self, event, context):
        """Handle proposal updates (Canceled/Executed)"""
        eventType = context.get('__typename')
        onchainId = event.get('data').get('proposalId')

        if not eventType:
            print(" [!] Missing event type in context")
            logger.log("Missing event type in context")
            return
        if not onchainId:
            print(" [!] Missing on-chain ID in event")
            logger.log("Missing on-chain ID in event")
            return

        print(f"Processed on-chain proposal ID: {onchainId}")
        logger.log(f"Processed on-chain proposal ID: {onchainId}")

        try:
            if eventType == 'ProposalExecuted':
                print("Redirecting the AUDIT-TRAIL-SERVICE event call to Execute Proposal")
                logger.log("Redirecting the AUDIT-TRAIL-SERVICE event call to Execute Proposal")
                OnchainVerificationService.update_verification_status_by_onchain_id(onchainId, 'approved')
            elif eventType == 'ProposalCanceled':
                print("Redirecting the AUDIT-TRAIL-SERVICE event call to Cancel Proposal")
                logger.log("Redirecting the AUDIT-TRAIL-SERVICE event call to Cancel Proposal")
                OnchainVerificationService.update_verification_status_by_onchain_id(onchainId, 'cancelled')
            else:
                print(f" [!] Unknown proposal event type: {eventType}")
                logger.log(f"Unknown proposal event type: {eventType}")
        except Exception as e:
            print(f" [✘] Failed to update verification status: {str(e)}")
            logger.log(f"Failed to update verification status: {str(e)}")

    def handle_proposal_created(self, event, context):
        """Handle new proposal creation - ProposalAdded event"""
        onChainData = event.get('onChainData', {})
        trxHash = onChainData.get('transactionHash')
        onchainId = event.get('data').get('proposalId')

        print(f"Received a ProposalAdded event - hash: {trxHash[:10] if trxHash else 'N/A'}...{trxHash[-10:] if trxHash else 'N/A'}")
        logger.log(f"Received a ProposalAdded event - hash: {trxHash[:10] if trxHash else 'N/A'}...{trxHash[-10:] if trxHash else 'N/A'}")


        if not onchainId:
            print(" [!] Missing proposal ID in ProposalAdded event")
            logger.log("Missing proposal ID in ProposalAdded event")
            return

        # Check proposal type
        proposalType = context.get("proposalType")
        if proposalType != 0 and proposalType != "membership":
            print(f" [⏭️] Skipping non-membership proposal (type: {proposalType})")
            logger.log(f"Skipping non-membership proposal (type: {proposalType})")
            return

        try:
            # Check if OnChainValidation record exists
            verification = OnchainVerificationService.get_verifications_by_trx_hash(trxHash)
            if not verification:
                print(f" [!] No OnChainValidation record found for {trxHash}")
                logger.log(f"No OnChainValidation record found for {trxHash}")

                return

            print(f" [*] Found OnChainValidation record (ID: {verification.id}) for {trxHash}")
            logger.log(f"Found OnChainValidation record (ID: {verification.id}) for {trxHash}")

            # Update the onchainId field with the proposal ID from the event
            updated_verification = OnchainVerificationService.update_verification_onchain_id_by_trx_hash(trxHash, onchainId)

            print(f" [✓] Successfully updated OnChainValidation record (ID: {updated_verification.id}) with proposal ID: {onchainId}")
            print(f" [✓] ProposalAdded event processed successfully for {trxHash}")

            logger.log(f"Successfully updated OnChainValidation record (ID: {updated_verification.id}) with proposal ID: {onchainId}")
            logger.log(f"ProposalAdded event processed successfully for {trxHash}")

        except Exception as e:
            print(f" [✘] Failed to process ProposalAdded event: {str(e)}")
            logger.log(f"Failed to process ProposalAdded event: {str(e)}")
