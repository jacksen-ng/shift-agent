# Step 1: Reactアプリのビルド
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Step 2: Nginxで配信
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run は 8080 番ポートで受け取る仕様
EXPOSE 8080

# Nginx をフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]
