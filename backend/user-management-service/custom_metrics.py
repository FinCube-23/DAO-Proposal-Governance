"""
Custom Business Metrics.

django-prometheus provides:
- HTTP metrics (django_http_*)
- DB metrics (django_db_*)
- Cache metrics (django_cache_*)
- Model metrics (django_model_*)

This file defines business-specific metrics:
- RabbitMQ metrics
"""

from prometheus_client import Counter

# Use default REGISTRY so metrics are exposed alongside django-prometheus metrics
from prometheus_client import REGISTRY

# ============================================================================
# RABBITMQ METRICS
# ============================================================================

rabbitmq_messages_published_total = Counter(
    name='rabbitmq_messages_published_total',
    documentation='Total messages published to RabbitMQ',
    labelnames=['queue', 'status'],
    registry=REGISTRY
)

rabbitmq_messages_consumed_total = Counter(
    name='rabbitmq_messages_consumed_total',
    documentation='Total messages consumed from RabbitMQ',
    labelnames=['queue', 'status'],
    registry=REGISTRY
)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def track_rabbitmq_publish(queue, success=True):
    """Track RabbitMQ publish operations"""
    status = 'success' if success else 'failure'
    rabbitmq_messages_published_total.labels(queue=queue, status=status).inc()

def track_rabbitmq_consume(queue, success=True):
    """Track RabbitMQ consume operations"""
    status = 'success' if success else 'failure'
    rabbitmq_messages_consumed_total.labels(queue=queue, status=status).inc()