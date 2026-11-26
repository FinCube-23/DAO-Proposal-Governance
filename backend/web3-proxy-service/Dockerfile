# Use official Node.js LTS image
# Needed for Otel as node:20 has certificates which the SDK needs
FROM node:20 AS builder

WORKDIR /app

# Copy only package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Run the build command
# This will create the dist directory with the compiled application
RUN npm run build

#Check if the build was successful
RUN ls -la dist/


#----- PRODUCTION---------
FROM node:20-alpine AS production
WORKDIR /app


# Change ownership of working directory to node user
RUN chown -R node:node /app


COPY package*.json ./

# Copy built application
COPY --from=builder --chown=node:node /app/dist ./dist

# For development mode, we need source files and TypeScript config
COPY --from=builder --chown=node:node /app/src ./src
COPY --from=builder --chown=node:node /app/tsconfig*.json ./
COPY --from=builder --chown=node:node /app/nest-cli.json ./

# Build toolchain for native npm modules (e.g. utf-8-validate, bufferutil).
# Alpine (musl) has no prebuilt binaries for some of them on every CPU arch
# (e.g. arm64 on Apple Silicon), so node-gyp must compile them from source.
RUN apk add --no-cache python3 make g++

# Install dependencies based on environment
# For development: install all dependencies (including devDependencies)
# For production: install only production dependencies
RUN if [ "$APP_ENV" = "DEVELOPMENT" ] || [ "$APP_ENV" = "DEV" ]; then \
  echo "Installing all dependencies for development mode..."; \
  npm install; \
  else \
  echo "Installing only production dependencies..."; \
  npm ci --omit-dev && npm cache clean --force; \
  fi


# Run as non-root user
# This is a good practice for security reasons
# node user is enabled by default in the node:20-alpine image
USER node
EXPOSE 3000

#checking APP_ENV and deciding in which mode to run
CMD if [ "$APP_ENV" = "DEVELOPMENT" ]; then \
  npm run start:dev; \
  else \
  npm run start:prod; \
  fi

