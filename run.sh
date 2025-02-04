#!/bin/bash

# Enable error handling
set -e

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
        start_backend
        ;;
    up)
        start_frontend
        start_backend
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
