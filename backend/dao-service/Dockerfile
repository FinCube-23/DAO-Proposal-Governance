# Use official Node.js LTS image
FROM node:20 as builder

WORKDIR /app

# Copy only package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
