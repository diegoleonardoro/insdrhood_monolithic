# Build stage with a specific Node version
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm cache clean --force && npm install --verbose
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html

# Default Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]