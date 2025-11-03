import pika
import time
from django.conf import settings
from pika.exceptions import AMQPConnectionError

class RabbitMQConnector:
    @staticmethod
    def get_connection(max_retries=3, retry_delay=5):
        attempt = 0
        while attempt < max_retries:
            try:
                connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=settings.RABBITMQ_HOST,
                        port=settings.RABBITMQ_PORT,
                        credentials=pika.PlainCredentials(
                            settings.RABBITMQ_USER,
                            settings.RABBITMQ_PASSWORD
                        ),
                        heartbeat=30,
                        blocked_connection_timeout=300
                    )
                )
                channel = connection.channel()
                return connection, channel
                
            except AMQPConnectionError:
                attempt += 1
                if attempt >= max_retries:
                    raise
                time.sleep(retry_delay)