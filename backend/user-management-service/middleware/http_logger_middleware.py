import time
from datetime import datetime
from django.utils.deprecation import MiddlewareMixin
from logging_config import logger


class HTTPLoggerMiddleware(MiddlewareMixin):
    """
    A middleware that logs request/response.
    """

    def process_request(self, request):
        request._start_time = time.time()

    def process_response(self, request, response):
        start = getattr(request, "_start_time", None)
        if start:
            response_time_ms = (time.time() - start) * 1000.0
        else:
            response_time_ms = None

        logData = {
            "message": f"{request.method} {request.get_full_path()} - {response.status_code} ({round(response_time_ms, 2)}ms)",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "method": request.method,
            "url": request.get_full_path(),
            "status_code": int(getattr(response, "status_code", 0)),
            "response_time_ms": (
                float(round(response_time_ms, 3))
                if response_time_ms is not None
                else 0.0
            ),
            "content_length": int(response.get("Content-Length") or 0),
            "content_type": request.META.get("CONTENT_TYPE"),
            "user_agent": request.META.get("HTTP_USER_AGENT"),
            "referer": request.META.get("HTTP_REFERER"),
            "client_ip": request.META.get("HTTP_X_REAL_IP")
            or request.META.get("REMOTE_ADDR"),
            "forwarded_for": request.META.get("HTTP_X_FORWARDED_FOR"),
            "request_id": request.META.get("HTTP_X_REQUEST_ID", "12300123"),
        }

        logger.log(logData)

        return response
