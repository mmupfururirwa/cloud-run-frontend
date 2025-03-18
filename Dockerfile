# ===========================
# Stage 1: Build Angular
# ===========================
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
# Important: Use SSR build command if you're using Angular Universal
RUN npm run build:ssr  

# ===========================
# Stage 2: Serve Angular + Proxy
# ===========================
FROM node:18
WORKDIR /app

# Copy Angular browser build
COPY --from=build /app/dist/device-app/browser ./dist/device-app/browser

# Copy Express server
COPY ./server ./server

# Install Express deps
RUN npm install express axios

EXPOSE 8080

CMD ["node", "./server/server.js"]