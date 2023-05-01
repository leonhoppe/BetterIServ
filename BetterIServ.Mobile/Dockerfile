FROM node:18-slim as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g @ionic/cli
RUN ionic build --prod

FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/sites-available/default
COPY --from=node /app/www /usr/share/nginx/html
