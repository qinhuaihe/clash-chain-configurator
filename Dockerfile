# Multi-stage Dockerfile for production Next.js build

# Builder stage: install deps (including dev) and build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies including devDependencies for the build
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# Runner stage: install only production deps and copy build output
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --production

# Copy build artifacts and static files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
