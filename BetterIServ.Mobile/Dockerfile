FROM node:18-slim as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g @ionic/cli
RUN ionic build --prod

FROM node:18-slim
EXPOSE 80
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
COPY --from=node /app/www ./www
CMD ["node", "server.js"]
