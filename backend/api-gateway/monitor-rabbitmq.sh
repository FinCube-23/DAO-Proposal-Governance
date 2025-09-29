#!/bin/bash

# RabbitMQ Exchange Message Monitor
# This script helps you monitor messages in RabbitMQ exchanges from Docker

echo "🐰 RabbitMQ Exchange Message Monitor"
echo "====================================="

# Function to show help
show_help() {
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --exchange NAME    Monitor specific exchange (default: exchange.transaction-receipt.fanout)"
    echo "  -f, --follow          Follow messages in real-time"
    echo "  -l, --list            List all exchanges"
    echo "  -q, --queues          List all queues"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -e exchange.transaction-receipt.fanout -f    # Follow messages in transaction-receipt exchange"
    echo "  $0 -l                      # List all exchanges"
    echo "  $0 -q                      # List all queues"
}

# Default values
EXCHANGE="exchange.transaction-receipt.fanout"
FOLLOW=false
LIST_EXCHANGES=false
LIST_QUEUES=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--exchange)
            EXCHANGE="$2"
            shift 2
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -l|--list)
            LIST_EXCHANGES=true
            shift
            ;;
        -q|--queues)
            LIST_QUEUES=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if RabbitMQ is accessible
echo "Checking RabbitMQ connectivity..."
if ! curl -s -u guest:guest http://localhost:15672/api/overview > /dev/null; then
    echo "❌ Cannot connect to RabbitMQ. Make sure it's running on port 15672"
    exit 1
fi
echo "✅ RabbitMQ is accessible"

# List exchanges
if [ "$LIST_EXCHANGES" = true ]; then
    echo ""
    echo "📋 Available Exchanges:"
    echo "======================"
    curl -s -u guest:guest http://localhost:15672/api/exchanges | jq -r '.[] | "\(.name) (\(.type)) - Durable: \(.durable)"'
    exit 0
fi

# List queues
if [ "$LIST_QUEUES" = true ]; then
    echo ""
    echo "📋 Available Queues:"
    echo "==================="
    curl -s -u guest:guest http://localhost:15672/api/queues | jq -r '.[] | "\(.name) - Messages: \(.messages) - Consumers: \(.consumers)"'
    exit 0
fi

# Check if exchange exists
echo ""
echo "Checking if exchange '$EXCHANGE' exists..."
EXCHANGE_EXISTS=$(curl -s -u guest:guest http://localhost:15672/api/exchanges/%2F/$EXCHANGE | jq -r '.name' 2>/dev/null)

if [ "$EXCHANGE_EXISTS" = "null" ] || [ -z "$EXCHANGE_EXISTS" ]; then
    echo "❌ Exchange '$EXCHANGE' does not exist"
    echo ""
    echo "Available exchanges:"
    curl -s -u guest:guest http://localhost:15672/api/exchanges | jq -r '.[] | "  - \(.name)"'
    exit 1
fi

echo "✅ Exchange '$EXCHANGE' exists"

# Monitor messages
echo ""
echo "📡 Monitoring messages in exchange: $EXCHANGE"
echo "=============================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

if [ "$FOLLOW" = true ]; then
    echo "🔄 Following messages in real-time..."
    echo ""
    
    # Create a temporary queue to bind to the exchange
    TEMP_QUEUE="temp-monitor-$(date +%s)"
    
    # Create temporary queue
    curl -s -u guest:guest -X PUT \
        -H "Content-Type: application/json" \
        -d '{"durable":false,"auto_delete":true}' \
        http://localhost:15672/api/queues/%2F/$TEMP_QUEUE > /dev/null
    
    # Bind queue to exchange
    curl -s -u guest:guest -X POST \
        -H "Content-Type: application/json" \
        -d '{"routing_key":"","arguments":{}}' \
        http://localhost:15672/api/bindings/%2F/e/$EXCHANGE/q/$TEMP_QUEUE > /dev/null
    
    echo "Temporary queue '$TEMP_QUEUE' created and bound to exchange"
    echo ""
    
    # Monitor messages
    while true; do
        # Get messages from the temporary queue
        MESSAGES=$(curl -s -u guest:guest -X POST \
            -H "Content-Type: application/json" \
            -d '{"count":10,"ackmode":"ack_requeue_false","encoding":"auto"}' \
            http://localhost:15672/api/queues/%2F/$TEMP_QUEUE/get)
        
        if [ "$MESSAGES" != "[]" ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') - New message(s) received:"
            echo "$MESSAGES" | jq -r '.[] | "  📧 \(.payload | fromjson | .email // "No email field") - Method: \(.payload | fromjson | .method // "Unknown") - Path: \(.payload | fromjson | .path // "Unknown")"'
            echo ""
        fi
        
        sleep 2
    done
else
    echo "📊 Exchange Statistics:"
    echo "======================"
    
    # Get exchange details
    EXCHANGE_INFO=$(curl -s -u guest:guest http://localhost:15672/api/exchanges/%2F/$EXCHANGE)
    echo "Name: $(echo $EXCHANGE_INFO | jq -r '.name')"
    echo "Type: $(echo $EXCHANGE_INFO | jq -r '.type')"
    echo "Durable: $(echo $EXCHANGE_INFO | jq -r '.durable')"
    echo "Auto Delete: $(echo $EXCHANGE_INFO | jq -r '.auto_delete')"
    
    echo ""
    echo "📋 Bound Queues:"
    echo "==============="
    BOUND_QUEUES=$(curl -s -u guest:guest http://localhost:15672/api/exchanges/%2F/$EXCHANGE/bindings/source)
    if [ "$BOUND_QUEUES" != "[]" ]; then
        echo "$BOUND_QUEUES" | jq -r '.[] | "  - \(.destination) (Routing Key: \(.routing_key))"'
    else
        echo "  No queues bound to this exchange"
    fi
    
    echo ""
    echo "💡 To follow messages in real-time, use: $0 -e $EXCHANGE -f"
fi
