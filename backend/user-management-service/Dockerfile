# Use official Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Expose Django's default port
EXPOSE 8000

# Command with conditional logic
CMD if [ "$APP_ENV" = "DEVELOPMENT" ] || [ "$APP_ENV" = "DEV" ]; then \
    echo "Development mode - Running migrations..."; \
    python manage.py makemigrations; \
    python manage.py migrate; \
    echo "Migrations completed"; \
    else \
    echo "Production mode - Skipping migrations"; \
    fi && \
    python manage.py runserver 0.0.0.0:8000