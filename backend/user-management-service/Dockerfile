FROM node:20 as builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

RUN npm run build

#----- PRODUCTION---------
FROM node:20-alpine as production

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy dist with proper permissions
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

CMD ["npm", "run", "start:prod"]