# lts-iron refers to Node.js LTS v20
# Using this instead of node:20 to avoid dependabot updates
FROM node:lts-iron as builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

FROM node:lts-iron

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 3000

CMD [ "node", "index.js"]

