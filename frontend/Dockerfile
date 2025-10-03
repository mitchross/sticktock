# Use an official Node.js LTS base image
FROM node:lts

ENV NEXT_TELEMETRY_DISABLED=1

# Use existing node user (UID 1000) for Talos OS compatibility
# The node:lts image already has a node user with UID/GID 1000

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies as root, then fix permissions
RUN npm ci && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Create cache directories and set proper ownership for Talos OS
RUN mkdir -p .next/cache/fetch-cache .next/cache/images && \
    chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user before runtime
USER node

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
