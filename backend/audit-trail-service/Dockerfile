# Use official Node.js LTS image
# Needed for Otel as node:20 has certificates which the SDK needs
FROM node:20 as builder

WORKDIR /app

# Copy only package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

RUN npm run build

#----- PRODUCTION---------
FROM node:20-alpine as production
WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit-dev && npm cache clean --force

# Copy only the necessary files
COPY --from=builder --chown=app:app /app/dist ./dist


EXPOSE 3000

CMD ["node", "dist/main.js"]

