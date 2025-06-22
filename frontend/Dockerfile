# Step 1: ビルド
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Step 2: Nginxで公開
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# 追加ここから 👇
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 追加ここまで 👆

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
