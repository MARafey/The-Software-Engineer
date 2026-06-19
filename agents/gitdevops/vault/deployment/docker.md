# Containerization & Image Optimization

- **Mandatory containerization**: all deployments run in Docker containers — host-level native deployments are forbidden.
- **Multi-stage builds**: separate build dependencies from the final runtime to minimize image size.
- **Numbered tags**: always tag images with explicit version numbers, never `latest`.

```dockerfile
# Stage 1: Build environment
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production environment (minimizes image size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm install pm2 -g
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
```
