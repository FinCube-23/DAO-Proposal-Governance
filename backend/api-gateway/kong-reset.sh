#!/bin/bash

# Kong Database Reset Script
# This script clears all Kong configuration for a fresh start

echo "🔄 Kong Database Reset"
echo "======================"

KONG_ADMIN_URL="http://localhost:8001"

# Function to make API calls to Kong
kong_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$KONG_ADMIN_URL$endpoint"
    else
        curl -s -X $method \
            -H "Content-Type: application/json" \
            "$KONG_ADMIN_URL$endpoint"
    fi
}

# Wait for Kong to be ready
echo "1. Waiting for Kong to be ready..."
until kong_api GET /status; do
    echo "   Kong is not ready yet. Waiting..."
    sleep 2
done
echo "   ✅ Kong is ready!"

echo ""
echo "2. Clearing all Kong configuration..."

# Delete all plugins first
echo "   Deleting all plugins..."
PLUGINS=$(kong_api GET /plugins | jq -r '.data[].id')
for plugin_id in $PLUGINS; do
    echo "     Deleting plugin: $plugin_id"
    kong_api DELETE "/plugins/$plugin_id"
done

# Delete all routes
echo "   Deleting all routes..."
ROUTES=$(kong_api GET /routes | jq -r '.data[].id')
for route_id in $ROUTES; do
    echo "     Deleting route: $route_id"
    kong_api DELETE "/routes/$route_id"
done

# Delete all services
echo "   Deleting all services..."
SERVICES=$(kong_api GET /services | jq -r '.data[].id')
for service_id in $SERVICES; do
    echo "     Deleting service: $service_id"
    kong_api DELETE "/services/$service_id"
done

echo ""
echo "✅ Kong database reset complete!"
echo "================================"
echo ""
echo "All services, routes, and plugins have been removed."
echo "You can now run ./kong-seeder.sh to populate with fresh configuration."
