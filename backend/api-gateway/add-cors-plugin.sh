#!/bin/bash

# Add CORS Plugin to Existing Kong Setup
# This script adds CORS support to your running Kong instance

echo "🌐 Adding CORS Plugin to Kong"
echo "============================="

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

# Check if Kong is running
echo "1. Checking Kong status..."
if ! kong_api GET /status > /dev/null 2>&1; then
    echo "   ❌ Kong is not running. Please start Kong first."
    echo "   Run: docker-compose up -d"
    exit 1
fi
echo "   ✅ Kong is running!"

# Check if CORS plugin already exists
echo "2. Checking existing CORS configuration..."
EXISTING_CORS=$(kong_api GET /plugins | jq -r '.data[] | select(.name == "cors") | .id')

if [ -n "$EXISTING_CORS" ]; then
    echo "   ⚠️  CORS plugin already exists (ID: $EXISTING_CORS)"
    echo "   Updating existing configuration..."
    
    CORS_PLUGIN_CONFIG='{
        "config": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:8002", "http://172.16.231.80", "http://172.16.231.80:3000"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "headers": ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization"],
            "exposed_headers": ["X-Auth-Token"],
            "credentials": true,
            "max_age": 3600,
            "preflight_continue": false
        }
    }'
    
    RESULT=$(kong_api PATCH "/plugins/$EXISTING_CORS" "$CORS_PLUGIN_CONFIG")
    
else
    echo "   Adding new CORS plugin..."
    
    CORS_PLUGIN_CONFIG='{
        "name": "cors",
        "config": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:8002", "http://172.16.231.80", "http://172.16.231.80:3000"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "headers": ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization"],
            "exposed_headers": ["X-Auth-Token"],
            "credentials": true,
            "max_age": 3600,
            "preflight_continue": false
        }
    }'
    
    RESULT=$(kong_api POST /plugins "$CORS_PLUGIN_CONFIG")
fi

# Verify the configuration
echo "3. Verifying CORS configuration..."
CORS_PLUGINS=$(kong_api GET /plugins | jq '.data[] | select(.name == "cors")')

if [ -n "$CORS_PLUGINS" ]; then
    echo "   ✅ CORS plugin configured successfully!"
    echo ""
    echo "📋 CORS Configuration:"
    echo "$CORS_PLUGINS" | jq '.config'
else
    echo "   ❌ Failed to configure CORS plugin"
    exit 1
fi

echo ""
echo "🎉 CORS Configuration Complete!"
echo "==============================="
echo ""
echo "✅ Your frontend at http://localhost:5173 and production server at http://172.16.231.80:3000 can now access:"
echo "   - http://localhost:3000/user-management-service/api/*"
echo "   - http://localhost:3000/dao-service/api/*"
echo "   - http://localhost:3000/audit-trail-service/api/*"
echo "   - http://localhost:3000/web3-proxy-service/api/*"
echo ""
echo "🔍 Test CORS with:"
echo "   curl -X OPTIONS http://localhost:3000/user-management-service/api/users/login \\"
echo "        -H 'Origin: http://localhost:5173' \\"
echo "        -H 'Access-Control-Request-Method: POST' \\"
echo "        -v"