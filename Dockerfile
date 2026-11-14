# --- Stage 1: Build Frontend (Vite) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm config set fetch-retries 5 && npm ci
COPY . .
RUN npx vite build --base=/MATEST/

# --- Stage 2: Runtime Production Image ---
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm config set fetch-retries 5 && npm ci --omit=dev

COPY . .
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "api/server.js"]
