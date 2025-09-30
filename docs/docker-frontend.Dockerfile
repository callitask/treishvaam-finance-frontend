## Dockerfile for frontend (multi-stage)

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
