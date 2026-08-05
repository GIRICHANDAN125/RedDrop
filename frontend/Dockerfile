# Dockerfile for RedDrop AI V2 Mobile / Web Frontend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .

# Build static web export or bundle
RUN npx expo export --platform web || true

EXPOSE 8081

CMD ["npx", "expo", "start", "--web", "--non-interactive"]

