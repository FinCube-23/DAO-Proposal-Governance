#!/bin/bash

# Save as run-project.sh in your project root
# Usage: 
#   Start: ./run-project.sh start
#   Stop:  ./run-project.sh stop

# Configuration
BACKEND_DIR="./backend"    # Backend directory with docker-compose
FRONTEND_DIR="./frontend"   # Frontend directory
BACKEND_PORT=3000           # Your backend exposed port
MAX_WAIT_TIME=30            # Max seconds to wait for backend

start_project() {
    echo "Starting backend services..."
    (cd "$BACKEND_DIR" && sudo docker compose up --build -d)
    
    echo "Waiting for backend to be ready on port $BACKEND_PORT..."
    attempt=0

    while ! nc -z localhost $BACKEND_PORT; do
        if [ $attempt -eq $MAX_WAIT_TIME ]; then
            echo "Backend failed to start within $MAX_WAIT_TIME seconds"
            stop_project
            exit 1
        fi
        attempt=$((attempt+1))
        sleep 1
        echo -n "."
    done

    echo -e "\n Backend is ready!"

    echo "Starting frontend development server..."
    (cd "$FRONTEND_DIR" && npm run dev)
}

stop_project() {
    echo "Stopping backend services..."
    (cd "$BACKEND_DIR" && sudo docker compose down)
}

# Handle Ctrl+C to stop both services
trap stop_project SIGINT

case "$1" in
    start)
        start_project
        ;;
    stop)
        stop_project
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        exit 1
esac