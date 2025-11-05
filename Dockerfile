# LPC Avatar Builder Dockerfile
# For local development and alternative hosting

FROM node:18-alpine

# Install git for submodules
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Initialize submodules
RUN git submodule init && \
    git submodule update --recursive || echo "No submodules to update"

# Create symlink for spritesheets
RUN if [ -d "assets/lpc/spritesheets" ] && [ ! -d "spritesheets" ]; then \
      ln -s assets/lpc/spritesheets spritesheets; \
    fi

# Create uploads directory
RUN mkdir -p /data/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]
