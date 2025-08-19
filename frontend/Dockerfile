# Build static frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* tsconfig.json vite.config.ts ./
COPY index.html ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --no-frozen-lockfile
COPY src ./src
RUN pnpm build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Serve 404.html for unknown routes, enable gzip, and set strong cache for hashed assets
RUN printf '\n\
map $uri $cache_control {\n\
  default                    "public, max-age=60";\n\
  ~*^/assets/.+\.[\w]{8,}\.\w+$ "public, max-age=31536000, immutable";\n\
}\n\
server {\n\
  listen 80;\n\
  gzip on;\n\
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n\
  root /usr/share/nginx/html;\n\
  add_header Cache-Control $cache_control;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
  error_page 404 /404.html;\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
