# Use Node.js LTS (Long Term Support) version as base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package.json and package-lock.json for better layer caching
COPY package*.json ./

# Install dependencies with npm ci for more reliable builds
# Also use production flag to avoid installing development dependencies
RUN npm ci --only=production

# -----------------------------------------------
# Use multi-stage build for a smaller final image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Set user to non-root
USER nodejs

# Copy only the necessary files from the builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Ensure proper permissions 
RUN chmod -R 755 /app

# Create a directory for logs and ensure node can write to it
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# Expose the port the app runs on
EXPOSE 8080

# Health check to verify the application is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:8080/ || exit 1

# Set NODE_OPTIONS for better memory management
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Command to run the application
CMD ["node", "src/app.js"]