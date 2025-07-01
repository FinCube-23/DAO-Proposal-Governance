#!/bin/bash

# Compile the contracts
npx hardhat compile

# Check if the compilation was successful
if [ $? -eq 0 ]; then
    echo "Compilation successful, running tests..."
    
    # Run tests
    npx hardhat test
    
    # Check if all tests passed
    if [ $? -eq 0 ]; then
        echo "All tests passed, deploying to Sepolia network..."
        
        # Deploy the contract to Sepolia network
        npx hardhat run scripts/01_deploy_dao_uup_v1.ts --network sepolia
        
        # Check if the deployment was successful
        if [ $? -eq 0 ]; then
            echo "Deployment successful, moving artifacts..."
            
            # Move the artifacts folder to another location
            rm -rf ../backend/web3-proxy-service/artifacts && mv artifacts ../backend/web3-proxy-service/
        else
            echo "Deployment failed."
        fi
    else
        echo "Some tests failed."
    fi
else
    echo "Compilation failed."
fi