# lts-iron refers to Node.js LTS v20
# Using this instead of node:20 to avoid dependabot updates

# ======= Builder Stage =======
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --chown=app:app . .
RUN npm run build

# ======= Production Stage =======
FROM node:20-alpine AS production
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./
RUN npm ci --omit-dev

# Copy only the necessary files
COPY --from=builder --chown=app:app /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
