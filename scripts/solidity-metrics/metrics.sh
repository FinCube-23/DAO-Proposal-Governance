#!/bin/bash

# Install solidity-code-metrics globally if not already installed
if ! command -v solidity-code-metrics &> /dev/null; then
  npm install -g solidity-code-metrics
fi

# Generate markdown report for all .sol files in contracts directory
solidity-code-metrics ../../web3/contracts/*.sol > solidity-metrics-report.md

echo "Markdown report written to solidity-metrics-report.md"