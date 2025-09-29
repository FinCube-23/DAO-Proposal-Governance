"""
NestJS: Automatically logs startup events (route mapping, module initialization, etc.) through its built-in logging system.
Django: Doesn't have built-in startup logging by default, so below code will handle that.
"""

from django.conf import settings
from logging_config import logger


def log_django_startup():
    try:
        from django.urls import get_resolver
        from django.db import connections

        # Log application initializing
        logger.log(
            {
                "message": "Django application initializing",
            },
            contextValue="DjangoApplication",
        )

        # Log database connections
        for db_alias in connections:
            db_config = settings.DATABASES.get(db_alias, {})
            logger.log(
                {
                    "message": f"Database connection configured: {db_alias}",
                    "engine": db_config.get("ENGINE", "unknown").split(".")[-1],
                    "host": db_config.get("HOST", "localhost"),
                },
                contextValue="DatabaseConfig",
            )

        # Log middleware
        logger.log(
            {"message": "Initializing middleware stack"},
            contextValue="MiddlewareRegistry",
        )

        for middleware in settings.MIDDLEWARE:
            middleware_name = middleware.split(".")[-1]
            logger.log(
                {"message": f"Registered middleware: {middleware_name}"},
                contextValue="MiddlewareRegistry",
            )

        # Log URL patterns (routes)
        _log_url_patterns()

        # Log final startup message
        logger.log(
            {
                "message": "Django application successfully started",
                "service_name": getattr(
                    settings, "SERVICE_NAME", "user-management-service"
                ),
                "version": getattr(settings, "SERVICE_VERSION", "1.0"),
            },
            contextValue="DjangoApplication",
        )

    except Exception as e:
        logger.error(
            {"message": "Error during startup logging", "error": str(e)},
            contextValue="DjangoApplication",
        )


def _log_url_patterns():
    """Log all registered URL patterns"""
    from django.urls import get_resolver

    logger.log({"message": "Registering URL patterns"}, contextValue="RouterExplorer")

    try:
        resolver = get_resolver()

        def extract_patterns(url_patterns, prefix=""):
            routes = []
            for pattern in url_patterns:
                try:
                    if hasattr(pattern, "url_patterns"):
                        # This is an included URL conf
                        routes.extend(
                            extract_patterns(
                                pattern.url_patterns, prefix + str(pattern.pattern)
                            )
                        )
                    else:
                        # This is an actual route
                        route_pattern = prefix + str(pattern.pattern)
                        callback = pattern.callback
                        if callback:
                            # Get HTTP methods if available
                            view_class = getattr(callback, "view_class", None)
                            if view_class:
                                methods = [
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "PATCH",
                                    "DELETE",
                                    "HEAD",
                                    "OPTIONS",
                                ]
                            else:
                                methods = ["ALL"]

                            routes.append(
                                {
                                    "pattern": route_pattern or "/",
                                    "methods": methods,
                                    "view": (
                                        callback.__name__
                                        if hasattr(callback, "__name__")
                                        else str(callback)
                                    ),
                                }
                            )
                except Exception:
                    continue
            return routes

        routes = extract_patterns(resolver.url_patterns)

        for route in routes:
            for method in route["methods"]:
                logger.log(
                    {"message": f"Mapped {{{route['pattern']}, {method}}} route"},
                    contextValue="RouterExplorer",
                )

    except Exception as e:
        logger.error(
            {"message": "Error logging URL patterns", "error": str(e)},
            contextValue="RouterExplorer",
        )
