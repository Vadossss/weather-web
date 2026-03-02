FROM node:25-alpine as builder

WORKDIR /app

COPY package.json /app/package.json

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.28.0-alpine

# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]