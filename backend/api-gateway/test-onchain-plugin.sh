#!/bin/bash

# Test script for OnChain Data Plugin
# Tests the updated plugin with onChainData field

echo "🧪 Testing OnChain Data RabbitMQ Publisher Plugin"
echo "================================================="

# Test data with login DTO + onChainData scenarios
declare -a TEST_CASES=(
    '{"email":"fahim@gmail.com","password":"12345678","onChainData":{"transactionHash":"0xabcdef1234567890","signedBy":"0x8ba1f109551bD432803012645Hac136c","signedWith":"MetaMask","chainId":"137","context":"sell-nft"}}'
    '{"email":"trader@crypto.com","password":"trading789","onChainData":{"transactionHash":"0x9876543210fedcba","signedBy":"0x1234567890123456789012345678901234567890","signedWith":"MetaMask","chainId":"56","context":"buy-token"}}'
    '{"email":"admin@bs23.com","password":"12345678","onChainData":{"transactionHash":"0xfedcba0987654321","signedBy":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","signedWith":"MetaMask","chainId":"42161","context":"stake-liquidity"}}'
)

echo "Test Cases (Login with OnChain Data):"
echo "1. DAO Vote Login Transaction"
echo "2. NFT Sale Login Transaction"
echo "3. Token Purchase Login Transaction"
echo "4. Liquidity Staking Login Transaction"
echo ""

# Test each case
for i in "${!TEST_CASES[@]}"; do
    echo "📤 Test Case $((i+1)):"
    echo "Payload: ${TEST_CASES[i]}"
    echo ""
    
    # Send the test request
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "${TEST_CASES[i]}" \
        "http://localhost:3000/user-management-service/api/users/login")
    
    # Extract HTTP code and response body
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')
    
    echo "Response: $RESPONSE_BODY"
    echo "HTTP Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo "✅ Success"
    else
        echo "❌ Failed"
    fi
    
    echo "----------------------------------------"
    echo ""
    
    # Wait a bit between requests
    sleep 1
done

echo "🔍 To view detailed logs, run:"
echo "docker logs kong_gateway | grep -E '(OnChainData|Transaction Hash|Signed By)'"
echo ""
echo "📊 To monitor RabbitMQ messages, run:"
echo "./monitor-rabbitmq.sh -e exchange.transaction-receipt.fanout -f"
echo ""
echo "📋 To check service logs:"
echo "docker logs user-management-service | grep 'Triggering transaction hash'"
echo "docker logs dao-service | grep 'Triggering transaction hash'"
echo "docker logs audit-trail-service | grep 'Triggering transaction hash'"
echo ""
echo "🔗 Test Endpoint:"
echo "http://localhost:3000/user-management-service/api/users/login"
echo ""
echo "📝 Example Request Body:"
echo '{"email":"user@example.com","password":"password123","onChainData":{"transactionHash":"0x123...","signedBy":"0x742...","signedWith":"MetaMask","chainId":"1","context":"dao-vote"}}'
