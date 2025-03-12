# Use official Node.js LTS image
FROM node:20 as builder

WORKDIR /app

# Copy only package.json and package-lock.json first for better caching
COPY dao-service/package*.json ./

# # Copy the external libs into /app/libs
COPY libs /app/libs

# # Update package.json paths to use /app/libs inside Docker
RUN sed -i 's|"file:../libs/validate-auth"|"file:libs/validate-auth"|g' package.json

# Install dependencies
RUN npm install

# Copy the rest of dao-service
COPY dao-service/. .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
