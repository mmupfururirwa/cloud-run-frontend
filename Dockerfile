# Use official NGINX image
# FROM nginx:alpine

# # Copy only the browser output (static files)
# COPY ./dist/device-app/browser /usr/share/nginx/html

# # Replace default NGINX config for Angular routing
# RUN rm /etc/nginx/conf.d/default.conf
# COPY ./nginx.conf /etc/nginx/conf.d

# EXPOSE 8080
# CMD ["nginx", "-g", "daemon off;"]



# Stage 1: Build Angular SSR
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:ssr

# Stage 2: Serve with Nginx + Node
FROM nginx:latest

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular static files
COPY --from=build /app/dist/device-app/browser /usr/share/nginx/html

# Copy Node SSR files
COPY --from=build /app/dist/device-app/server /app/server

# Install Node for SSR
RUN apt update && apt install -y nodejs npm
WORKDIR /app/server
RUN npm install express

# Start both Nginx & Node
CMD node server.mjs