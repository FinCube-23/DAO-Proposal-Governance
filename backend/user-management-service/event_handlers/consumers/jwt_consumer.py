# event_handlers/consumers/jwt_consumer.py
import pika
from django.conf import settings

def start_jwt_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=settings.RABBITMQ_HOST)
    )
    channel = connection.channel()
    
    channel.queue_declare(queue='authorization')
    
    def callback(ch, method, properties, body):
        print(" [x] Received %r" % body)
    
    channel.basic_consume(
        queue='authorization',
        on_message_callback=callback,
        auto_ack=True
    )
    
    print(' [*] Waiting for JWT validation requests...')
    channel.start_consuming()