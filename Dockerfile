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
# FROM node:18 AS build

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build:ssr

# # Stage 2: Serve with Nginx + Node.js
# FROM nginx:1.27

# # Copy Nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy static Angular files to Nginx
# COPY --from=build /app/dist/device-app/browser /usr/share/nginx/html

# # Copy server bundle
# COPY --from=build /app/dist/device-app/server /app/server

# # Copy package.json & install server dependencies
# COPY package*.json /app/server/
# WORKDIR /app/server
# RUN npm install

# # Expose ports
# EXPOSE 8080 4000

# # Start Node.js server
# CMD ["sh", "-c", "node server.mjs & nginx -g 'daemon off;'"]


# Stage 1: Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Stage 2: Serve Angular & Proxy
FROM node:18
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY ./proxy ./proxy
RUN npm install express axios
CMD ["node", "./proxy/server.js"]