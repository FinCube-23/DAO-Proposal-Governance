"""Django's command-line utility for administrative tasks."""

import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:

        from django.core.management import execute_from_command_line

        # Initialize tracing and logging config
        import tracing
        from logging_config import logger

        # If running the server, log startup info after Django is ready
        if len(sys.argv) > 1 and sys.argv[1] == "runserver":
            import django

            django.setup()
            tracing.instrument_app()

        execute_from_command_line(sys.argv)

        logger.log({"message": "User Management Service started successfully"})

    except ImportError as exc:
        logger.error(
            {"message": "Failed to start User Management Service.", "error": str(exc)}
        )
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc


if __name__ == "__main__":
    main()
