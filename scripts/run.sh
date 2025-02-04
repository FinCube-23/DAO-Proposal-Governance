#!/bin/bash

# Commands:
#   Backend only:  ./scripts/run.sh backend
#   Frontend only: ./scripts/run.sh frontend
#   Both:          ./scripts/run.sh start
#   Stop:          ./scripts/run.sh stop

# Configuration
BACKEND_DIR="./backend"    # Backend directory with docker-compose
FRONTEND_DIR="./frontend"   # Frontend directory
BACKEND_PORT=3000           # Your backend exposed port
MAX_WAIT_TIME=30            # Max seconds to wait for backend

start_backend() {
    echo "Starting backend services..."
    (cd "$BACKEND_DIR" && sudo docker compose up --build -d)
    
    echo "Waiting for backend to be ready..."
    attempt=0
    
    while ! nc -z localhost $BACKEND_PORT; do
        if [ $attempt -eq $MAX_WAIT_TIME ]; then
            echo " Backend failed to start!"
            stop_project
            exit 1
        fi
        attempt=$((attempt+1))
        sleep 1

        echo -n "."
    done

    echo -e "\n Backend is ready!"
}

start_frontend() {
    echo "Starting frontend..."
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
        start_backend
        start_frontend
        ;;
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    stop)
        stop_project
        ;;
    *)
        echo "Usage: $0 {start|stop|backend|frontend}"
        echo "   start    - Start both backend and frontend"
        echo "   backend  - Start only the backend"
        echo "   frontend - Start only the frontend"
        echo "   stop     - Stop the backend"
        exit 1
esac