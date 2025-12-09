import json
import pika
from django.conf import settings
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from custom_metrics import track_rabbitmq_publish
import logging

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    """
    Utility class for publishing messages to RabbitMQ.
    Handles connection management, exchange/queue declaration, and message publishing.
    """
    
    @staticmethod
    def publish_message(exchange_name, routing_key, message_body, exchange_type='topic', durable=True):
        """
        Publish a message to RabbitMQ.
        
        Args:
            exchange_name: Name of the exchange to publish to
            routing_key: Routing key for the message (queue name for direct routing)
            message_body: Dictionary containing the message data
            exchange_type: Type of exchange ('topic', 'fanout', 'direct')
            durable: Whether the exchange/queue should be durable
            
        Returns:
            bool: True if successful, False otherwise
        """
        connection = None
        try:
            # Get connection
            connection, channel = RabbitMQConnector.get_connection()
            
            # Declare exchange
            channel.exchange_declare(
                exchange=exchange_name,
                exchange_type=exchange_type,
                durable=durable
            )
            
            # If using direct routing or want to ensure queue exists, declare it
            if routing_key:
                channel.queue_declare(queue=routing_key, durable=durable)
                if exchange_type != 'fanout':
                    channel.queue_bind(
                        queue=routing_key,
                        exchange=exchange_name,
                        routing_key=routing_key
                    )
            
            # Publish message
            channel.basic_publish(
                exchange=exchange_name,
                routing_key=routing_key,
                body=json.dumps(message_body),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            
            logger.info(f"Published message to exchange: {exchange_name}, routing_key: {routing_key}")
            track_rabbitmq_publish(queue=routing_key or exchange_name, success=True)
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish message: {str(e)}")
            track_rabbitmq_publish(queue=routing_key or exchange_name, success=False)
            return False
            
        finally:
            if connection and connection.is_open:
                connection.close()
    
    @staticmethod
    def publish_organization_user_created(org_user_data):
        """
        Publish organization user creation event.
        
        Args:
            org_user_data: Dictionary containing organization user data
        """
        message = {
            'event_type': 'organization.user.created',
            'timestamp': org_user_data.get('created_at'),  # ✅ Fixed
            'data': org_user_data
        }
        
        return RabbitMQPublisher.publish_message(
            exchange_name='exchange.ums.events',
            routing_key='organization.user.created',
            message_body=message
        )
    
    @staticmethod
    def publish_organization_created(organization_data):
        """
        Publish organization creation event.
        
        Args:
            organization_data: Dictionary containing organization data
        """
        message = {
            'event_type': 'organization.created',
            'timestamp': organization_data.get('created_at'),
            'data': organization_data
        }
        
        return RabbitMQPublisher.publish_message(
            exchange_name='exchange.ums.events',
            routing_key='organization.created',
            message_body=message
        )
    
    @staticmethod
    def publish_sync_data(sync_data):
        """
        Publish bulk sync data (all users and their organizations).
        
        Args:
            sync_data: Dictionary containing users and organizations data
        """
        message = {
            'event_type': 'ums.sync',
            'timestamp': sync_data.get('timestamp'),
            'data': sync_data
        }
        
        return RabbitMQPublisher.publish_message(
            exchange_name='exchange.ums.events',
            routing_key='ums.sync',
            message_body=message
        )