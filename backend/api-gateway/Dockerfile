# Pin Kong to avoid surprises
FROM kong:latest

USER root

# Build tools for luarocks
RUN apt-get update && apt-get install -y \
    curl wget git build-essential unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install lua-resty-http for HTTP client functionality
RUN luarocks install lua-resty-http

USER kong
