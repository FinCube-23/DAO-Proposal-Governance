# Multi-stage build for production optimization
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production=false

COPY ..

# Build the application (if you have a build step)
RUN npm run build


#----- PRODUCTION---------
FROM node:20-alpine as production

WORKDIR /app

COPY package*.json

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage 
# --chown=app:app, ensures your security best practices and avoids file permission issues
COPY --from=builder --chown=app:app /app/dist ./dist

EXPOSE 3000

# Use production command
CMD ["node", "dist/main.js"]
