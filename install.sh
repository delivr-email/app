#!/bin/bash
set -e

echo ""
echo "  Welcome to Delivr"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Install it first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  exit 1
fi

# Detect server IP
SERVER_IP=$(curl -4s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

# Interactive prompts
echo "  Detected server IP: $SERVER_IP"
echo ""
read -p "  API port [3000]: " API_PORT
API_PORT=${API_PORT:-3000}
read -p "  SMTP port [25]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-25}
echo ""

# Generate secrets
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
BETTER_AUTH_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)

# Create directory
mkdir -p delivr/data
cd delivr

# Write .env
cat > .env <<EOF
API_PORT=$API_PORT
HOST_SMTP_PORT=$SMTP_PORT
DOMAIN=$SERVER_IP
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
EOF

# Write docker-compose.yml
cat > docker-compose.yml <<'COMPOSE'
services:
  app:
    image: ghcr.io/delivr-email/delivr-app:main
    ports:
      - "${API_PORT}:3000"
    environment:
      DATABASE_URL: "postgresql://delivr:${POSTGRES_PASSWORD}@postgres:5432/delivr"
      REDIS_URL: "redis://redis:6379"
      SMTP_HOST: "postfix"
      SMTP_PORT: "25"
      BETTER_AUTH_SECRET: "${BETTER_AUTH_SECRET}"
      BETTER_AUTH_URL: "http://localhost:${API_PORT}"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      postfix:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: delivr
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
      POSTGRES_DB: delivr
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U delivr"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - ./data/redis:/data
    restart: unless-stopped

  postfix:
    image: boky/postfix
    environment:
      ALLOWED_SENDER_DOMAINS: "${DOMAIN}"
      HOSTNAME: "${DOMAIN}"
    ports:
      - "${HOST_SMTP_PORT}:25"
      - "587:587"
    volumes:
      - ./data/dkim:/etc/opendkim/keys
    restart: unless-stopped
COMPOSE

echo "  Starting services..."
docker compose pull
docker compose up -d

echo ""
echo "  Delivr is running!"
echo ""
echo "  API:       http://${SERVER_IP}:${API_PORT}"
echo "  Dashboard: http://${SERVER_IP}:${API_PORT}/dashboard"
echo ""
echo "  To update later:"
echo "    cd delivr && docker compose pull app && docker compose up -d"
echo ""
