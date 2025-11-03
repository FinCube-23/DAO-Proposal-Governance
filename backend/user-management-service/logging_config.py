import os
import logging
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource

# OpenTelemetry logs SDK
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor

# OTLP log exporter
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter

import logging_loki

# === MASK CONFIG ===
MASK_CONFIG = {
    "emailFields": ["email"],
    "passwordFields": ["password"],
    "phoneFields": ["phone","contact_number"],
    "cardFields": ["creditCard", "cardNumber", "wallet"],
    "uuidFields": ["uuid"],
    "jwtFields": ["jwtToken"],
    "stringFields": ["ssn", "licenseNumber"],
    "genericStrings": [
        {
            "config": {
                "maskWith": "*",
                "unmaskedStartCharacters": 4,
                "unmaskedEndCharacters": 2,
            },
            "fields": ["trxHash"],
        }
    ],
}


# This function masks a string s by replacing parts of it with a specified character
def _mask_value(s, unmasked_start=0, unmasked_end=0, mask_with="*"):
    s = str(s)
    length = len(s)
    # If unmasked_end is zero, we slice to the end; otherwise slice last unmasked_end chars
    if unmasked_end == 0:
        # keep first unmasked_start chars, mask the rest
        return s[:unmasked_start] + mask_with * (length - unmasked_start)
    else:
        # keep first unmasked_start, mask middle, keep last unmasked_end
        keep_end = s[-unmasked_end:]  # last unmasked_end chars
        masked_middle = mask_with * (length - unmasked_start - unmasked_end)
        return s[:unmasked_start] + masked_middle + keep_end


"""
This function recursively traverses a dictionary and masks values associated with keys that match any of the sensitive fields defined in MASK_CONFIG.
"""
def mask_sensitive_data(obj):
    """
    A simple masking implementation: it walks the dict and masks values for keys listed in MASK_CONFIG.
    """
    # If obj is not a dictionary, return it
    if not isinstance(obj, dict):
        return obj
    out = {}
    for k, v in obj.items():
        if v is None:
            out[k] = v
            continue
        lowered = k.lower()
        # direct fields
        if any(
            field.lower() == lowered for field in MASK_CONFIG.get("passwordFields", [])
        ):
            out[k] = _mask_value(v, 0, 0, "*")
            continue
        if any(
            field.lower() == lowered for field in MASK_CONFIG.get("emailFields", [])
        ):
            # mask inside email (keep domain)
            try:
                name, domain = str(v).split("@", 1)
                out[k] = _mask_value(name, 1, 0, "*") + "@" + domain
            except Exception:
                out[k] = _mask_value(v, 1, 0, "*")
            continue
        if any(
            field.lower() == lowered for field in MASK_CONFIG.get("phoneFields", [])
        ):
            # mask inside number
            out[k] = _mask_value(v, 1, 0, "*")
            continue
        if any(field.lower() == lowered for field in MASK_CONFIG.get("cardFields", [])):
            out[k] = _mask_value(v, 0, 4, "*")
            continue
        if any(field.lower() == lowered for field in MASK_CONFIG.get("uuidFields", [])):
            out[k] = _mask_value(v, 0, 4, "*")
            continue
        if any(
            field.lower() == lowered for field in MASK_CONFIG.get("stringFields", [])
        ):
            out[k] = _mask_value(v, 0, 2, "*")
            continue
        # generic strings config
        for g in MASK_CONFIG.get("genericStrings", []):
            for f in g.get("fields", []):
                if f.lower() == lowered:
                    cfg = g.get("config", {})
                    out[k] = _mask_value(
                        v,
                        cfg.get("unmaskedStartCharacters", 0),
                        cfg.get("unmaskedEndCharacters", 0),
                        cfg.get("maskWith", "*"),
                    )
                    break
            else:
                continue
            break
        else:
            # if nested dict, recurse
            if isinstance(v, dict):
                out[k] = mask_sensitive_data(v)
            else:
                out[k] = v
    return out


# === OpenTelemetry Logs provider setup ===
_resource = Resource.create(
    {
        "service.name": os.environ.get("SERVICE_NAME", "user-management-service"),
        "service.namespace": os.environ.get("SERVICE_NAMESPACE", "user-service-api"),
        "service.version": os.environ.get("SERVICE_VERSION", "1.0"),
        "service.instance.id": os.environ.get("SERVICE_INSTANCE_ID", "1"),
    }
)

logger_provider = LoggerProvider(resource=_resource)
set_logger_provider(logger_provider)
otlp_log_exporter = OTLPLogExporter(endpoint=os.environ.get("OTEL_LOG_COLLECTOR"))
logger_provider.add_log_record_processor(BatchLogRecordProcessor(otlp_log_exporter))


# === Python logger with Console (JSON), File, Loki, and OTLP handlers ===
class Logger:
    def __init__(self, name="user-management-service"):
        self.default_context = "Application"
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        # avoid duplicate handlers in reloads
        if self.logger.handlers:
            return

        # JSON formatter
        fmt = "%(asctime)s %(levelname)s %(name)s %(message)s %(trace_id)s %(span_id)s"
        json_formatter = jsonlogger.JsonFormatter(fmt)

        # Console
        ch = logging.StreamHandler()
        ch.setFormatter(json_formatter)
        self.logger.addHandler(ch)

        # File
        log_dir = os.environ.get("LOG_DIR", "logs")
        os.makedirs(log_dir, exist_ok=True)
        fh = logging.handlers.RotatingFileHandler(
            "logs/app.log", maxBytes=10 * 1024 * 1024, backupCount=5
        )
        fh.setFormatter(json_formatter)
        self.logger.addHandler(fh)

        # Loki
        loki_url = os.environ.get("LOG_SERVER")

        loki_handler = logging_loki.LokiHandler(
            url=loki_url,
            tags={
                "service_name": os.environ.get(
                    "SERVICE_NAME", "user-management-service"
                ),
                "service_namespace": os.environ.get(
                    "SERVICE_NAMESPACE", "user-service-api"
                ),
            },
            version="1",
        )
        self.logger.addHandler(loki_handler)

        # OpenTelemetry
        otel_handler = LoggingHandler(level=logging.INFO)
        self.logger.addHandler(otel_handler)

    def _get_trace_id(self):
        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx is None or ctx.trace_id is None:
            return "N/A"
        return "{:032x}".format(ctx.trace_id)

    def _get_span_id(self):
        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx is None or ctx.span_id is None:
            return "N/A"
        return "{:016x}".format(ctx.span_id)

    def _create_log_entry(self, message, level="info", contextValue=None):
        
        masked = mask_sensitive_data(message)
        
        
        entry = {
            "context": contextValue or self.default_context,
            "message": masked,
            "level": level,
            "trace_id": self._get_trace_id(),
            "span_id": self._get_span_id(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        return entry

    def set_context(self, contextValue):
        self.default_context = contextValue

    def log(self, message, contextValue=None):
        entry = self._create_log_entry(message, "info", contextValue)
        self.logger.info(
            json.dumps(entry),
            extra={"trace_id": entry["trace_id"], "span_id": entry["span_id"]},
        )

    def error(self, message, trace_str=None, contextValue=None):
        entry = self._create_log_entry(message, level="error", contextValue=contextValue)
        if trace_str:
            entry["error_stack"] = trace_str
        self.logger.error(
            json.dumps(entry),
            extra={"trace_id": entry["trace_id"], "span_id": entry["span_id"]},
        )

    def warn(self, message, contextValue=None):
        entry = self._create_log_entry(message, "warn", contextValue)
        self.logger.warning(
            json.dumps(entry),
            extra={"trace_id": entry["trace_id"], "span_id": entry["span_id"]},
        )

    def debug(self, message, contextValue=None):
        entry = self._create_log_entry(message, "debug", contextValue)
        self.logger.debug(
            json.dumps(entry),
            extra={"trace_id": entry["trace_id"], "span_id": entry["span_id"]},
        )

    def verbose(self, message, contextValue=None):
        entry = self._create_log_entry(message, "verbose", contextValue)
        self.logger.info(
            json.dumps(entry),
            extra={"trace_id": entry["trace_id"], "span_id": entry["span_id"]},
        )


logger = Logger()
