import pika
import time
from django.conf import settings

def start_jwt_consumer():
    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    credentials=pika.PlainCredentials(
                        settings.RABBITMQ_USER,
                        settings.RABBITMQ_PASSWORD
                    ),
                    heartbeat=30
                )
            )
            channel = connection.channel()
            
            # Choose ONE of these declarations:
            
            # For new durable queue:
            channel.queue_declare(
                queue='authorization',
                durable=True,
            )
            
            # OR for non-durable queue:
            # channel.queue_declare(queue='authorization', durable=False)
            
            def callback(ch, method, properties, body):
                print(f" [x] Received {body.decode()}")
                # Process JWT validation here
                
            channel.basic_consume(
                queue='authorization',
                on_message_callback=callback,
                auto_ack=True
            )
            
            print(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
            
        except pika.exceptions.ChannelClosedByBroker as e:
            if e.reply_code == 406:
                print("\nERROR: Queue declaration mismatch. Please:")
                print("1. Delete the queue:")
                print("   docker exec rabbitmq rabbitmqadmin delete queue name=authorization")
                print("OR")
                print("2. Update the queue_declare parameters in jwt_consumer.py")
            break
        except pika.exceptions.AMQPConnectionError:
            print("Connection failed, retrying...")
            time.sleep(5)
            continue
        except KeyboardInterrupt:
            print("Consumer stopped")
            connection.close()
            break