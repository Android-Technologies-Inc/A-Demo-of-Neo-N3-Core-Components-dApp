    
FROM nginx:1.13.3-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY ./build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY seraphid.io.crt /etc/nginx/ssl.crt
COPY seraphid.io.key /etc/nginx/ssl.key
EXPOSE 443 80
CMD ["nginx", "-g", "daemon off;"]