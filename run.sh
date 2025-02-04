#!/bin/bash

# Enable error handling
set -e

# List of backend microservices
SERVICES=("audit-trail-service" "dao-service" "user-management-service" "web3-proxy-service" "rabbitmq")

# Required Docker Network
NETWORK_NAME="fincube23_network"

# Function to start the frontend
start_frontend() {
    echo "Starting frontend in a new terminal..."
    
    # Check for terminal emulator
    if command -v gnome-terminal &>/dev/null; then
        gnome-terminal -- bash -c "cd frontend && npm i && npm run dev; exec bash"
    elif command -v x-terminal-emulator &>/dev/null; then
        x-terminal-emulator -e bash -c "cd frontend && npm i && npm run dev; exec bash"
    elif command -v konsole &>/dev/null; then
        konsole -e bash -c "cd frontend && npm i && npm run dev; exec bash"
    elif command -v tmux &>/dev/null; then
        tmux new-session -d -s frontend 'cd frontend && npm i && npm run dev'
    else
        echo "No supported terminal found. Running in background instead..."
        (cd frontend && npm i && npm run dev) &
    fi
}

# clear_demon_conflict(){
#     docker rm -f <CONTAINER-NAME>
# }

ensure_docker_network() {
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        echo "Docker network '$NETWORK_NAME' not found. Creating it..."
        docker network create "$NETWORK_NAME"
        echo "Network '$NETWORK_NAME' created."
    else
        echo "Network '$NETWORK_NAME' already exists."
    fi
}

# Function to start a specific backend service
start_backend_service() {
    local service=$1
    echo "Starting $service..."
    cd "backend/$service"
    docker-compose up -d
    cd - >/dev/null
}

# Function to stop a specific backend service
stop_backend_service() {
    local service=$1
    echo "Stopping $service..."
    cd "backend/$service"
    docker-compose down
    cd - >/dev/null
}

start_all_backends() {
    ensure_docker_network
    for service in "${SERVICES[@]}"; do
        start_backend_service "$service"
    done
    echo "All backend services started."
}

stop_all_backends() {
    for service in "${SERVICES[@]}"; do
        stop_backend_service "$service"
    done
    echo "All backend services stopped."
}

# Function to display usage instructions
usage() {
    echo "Usage: ./run.sh [command]"
    echo "Commands:"
    echo "  up-fe    Start frontend in a new terminal"
    echo "  up-be     Start backend in a new terminal"
    echo "  up         Start frontend and backend in separate terminals"
    echo "  help           Show usage information"
}

# Main script logic
case "$1" in
    up-fe)
        start_frontend
        ;;
    up-be)
        start_all_backends
        ;;
    up)
        start_frontend
        start_all_backends
        ;;
    down)
        stop_all_backends
        ;;
    help)
        usage
        ;;
    *)
        echo "Invalid command!"
        usage
        exit 1
        ;;
esac
