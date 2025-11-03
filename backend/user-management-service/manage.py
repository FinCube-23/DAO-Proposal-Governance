"""Django's command-line utility for administrative tasks."""
import os
import sys
import time


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        # Special run mode for consumers
        if len(sys.argv) > 1 and sys.argv[1] == "run_consumers":
            # Import tracing and logging first
            import tracing
            import logging_config

            from event_handlers.consumers import start_consumers

            # Log consumer startup
            logging_config.logger.log(
                {"message": "Initializing RabbitMQ consumers"},
                contextValue="RabbitMQModule",
            )

            start_consumers()

            logging_config.logger.log(
                {"message": "RabbitMQ consumers successfully started"},
                contextValue="RabbitMQModule",
            )

            print("Consumers started. Press Ctrl+C to exit.")

            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                sys.exit(0)
        else:
            # Regular Django commands (runserver, migrate, etc.)
            from django.core.management import execute_from_command_line

            # Import tracing before Django starts
            import tracing
            import logging_config

            # If running the server, log startup info after Django is ready
            if len(sys.argv) > 1 and sys.argv[1] == "runserver":
                import django

                django.setup()

                # Now log startup information
                from startup_logger import log_django_startup

                log_django_startup()

            execute_from_command_line(sys.argv)

    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc


if __name__ == "__main__":
    main()
