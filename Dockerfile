# Use official NGINX image
FROM nginx:alpine

# Copy only the browser output (static files)
COPY ./dist/device-app/browser /usr/share/nginx/html

# Replace default NGINX config for Angular routing
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
