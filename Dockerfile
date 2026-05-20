# Stage 1: Build Remotion player bundle
FROM node:20-slim AS node-builder
WORKDIR /build
COPY remotion-viz/package*.json ./
RUN npm ci
COPY remotion-viz/ ./
RUN npm run build:player

# Stage 2: Python app
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=node-builder /build/dist ./remotion-viz/dist

RUN mkdir -p /data

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
