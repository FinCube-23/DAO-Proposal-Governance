# lts-iron refers to Node.js LTS v20
# Using this instead of node:20 to avoid dependabot updates
FROM node:lts-iron as builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

RUN npm run build

RUN npm prune

FROM node:lts-iron

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/*.env ./
COPY --from=builder /usr/src/app/.env.* ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]

