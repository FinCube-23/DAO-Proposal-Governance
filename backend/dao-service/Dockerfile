# lts-iron refers to Node.js LTS v20
# Using this instead of node:20 to avoid dependabot updates
FROM node as builder
WORKDIR /app

COPY package*.json ./

RUN npm install

# --chown=app:app, ensures your security best practices and avoids file permission issues
COPY --chown=app:app . .

# Expose the port your app runs on
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

