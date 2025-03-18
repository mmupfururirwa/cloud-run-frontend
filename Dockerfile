# ===============================
# Stage 1: Build Angular App
# ===============================
FROM node:18 AS build
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies & build Angular
RUN npm install
RUN npm run build --prod

# ===============================
# Stage 2: Serve Angular + Proxy
# ===============================
FROM node:18
WORKDIR /app

# Copy built Angular app
COPY --from=build /app/dist ./dist

# Copy server (proxy) folder
COPY ./server ./server

# Install Express dependencies
RUN npm install express axios

# Expose port 8080 (for Cloud Run)
EXPOSE 8080

# Start proxy + serve Angular
CMD ["node", "./server/server.js"]