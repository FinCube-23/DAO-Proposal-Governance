import pika
import time
import json
from event_handlers.utils.rabbitmq_connector import RabbitMQConnector
from event_handlers.utils.authorization_processor import process_authorization_request
from logging_config import logger

def start_jwt_consumer():
    logger.set_context("JWTConsumer")
    while True:
        try:
            connection, channel = RabbitMQConnector.get_connection()
            channel.queue_declare(queue='authorization', durable=True)
            channel.basic_qos(prefetch_count=1)

            def callback(ch, method, properties, body):
                try:
                    logger.log(f"Received raw message {body.decode()[:200]}...")
                    response = process_authorization_request(body)
                    logger.log(f"Sending response: {json.dumps(response)}...")

                    if properties.reply_to:
                        ch.basic_publish(
                            exchange='',
                            routing_key=properties.reply_to,
                            properties=pika.BasicProperties(
                                correlation_id=properties.correlation_id,
                                content_type='application/json'
                            ),
                            body=json.dumps(response)
                        )
                    
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                    print(" [✓] Message processed successfully")

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {str(e)}")
                    print(f" [✗] Invalid JSON: {str(e)}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                except Exception as e:
                    logger.error(f"Processing failed: {str(e)}")
                    print(" [✗] Consumer stopped")
                    print(f"Processing failed: {str(e)}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            channel.basic_consume(
                queue='authorization',
                on_message_callback=callback,
                auto_ack=False
            )
            logger.log("Authorization consumer ready")
            print(" [*] Authorization consumer ready (validation not implemented)")
            channel.start_consuming()

        except KeyboardInterrupt:
            if connection and connection.is_open:
                connection.close()
            break
        except Exception as e:
            print(f"Connection error: {str(e)}")
            time.sleep(5)