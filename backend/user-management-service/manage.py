#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        # Special run mode for consumers
        if sys.argv[1] == "run_consumers":
            from event_handlers.consumers import start_consumers
            start_consumers()
            print("Consumers started. Press Ctrl+C to exit.")
            try:
                while True: time.sleep(1)
            except KeyboardInterrupt:
                sys.exit(0)
        else:
            from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
