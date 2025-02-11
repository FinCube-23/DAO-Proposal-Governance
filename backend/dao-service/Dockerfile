# lts-iron refers to Node.js LTS v20
# Using this instead of node:20 to avoid dependabot updates
FROM node as builder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --chown=app:app . .

# Expose the port your app runs on
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

