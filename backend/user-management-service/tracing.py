import os
import atexit
import sys

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

# Instrumentations
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.pika import PikaInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor

resource = Resource.create(
    {
        "service.name": os.environ.get("SERVICE_NAME", "user-management-service"),
        "service.namespace": os.environ.get("SERVICE_NAMESPACE", "user-service-api"),
        "service.version": os.environ.get("SERVICE_VERSION", "1.0"),
        "service.instance.id": os.environ.get("SERVICE_INSTANCE_ID", "1"),
    }
)

# Set up tracer provider + exporter
trace_provider = TracerProvider(resource=resource)
otlp_exporter = OTLPSpanExporter(endpoint=os.environ.get("OTEL_TRACE_COLLECTOR"))
trace_provider.add_span_processor(SimpleSpanProcessor(otlp_exporter))
trace.set_tracer_provider(trace_provider)

# Auto-instrument Django and common libs
DjangoInstrumentor().instrument()
RequestsInstrumentor().instrument()
Psycopg2Instrumentor().instrument()
PikaInstrumentor().instrument()
LoggingInstrumentor().instrument(set_logging_format=True)

print("OpenTelemetry SDK (tracing) started for user-management-service")


# Graceful shutdown - flush and shut OTel tracer provider on SIGINT/SIGTERM
def _shutdown(*_):
    tp = trace.get_tracer_provider()
    if hasattr(tp, "shutdown"):
        try:
            tp.shutdown()
            print("Tracer provider shut down successfully")
        except Exception as e:
            print("Error shutting down tracer provider:", e)
    # then exit the process
    sys.exit(0)


atexit.register(_shutdown)
