# Use an official Node.js LTS base image
FROM node:lts

ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user with UID 1000 for Talos OS compatibility
# Use existing GID 1000 if it exists, otherwise create nextjs group
RUN useradd --uid 1000 --gid 1000 --system --shell /bin/bash --create-home nextjs 2>/dev/null || \
    (groupadd --system nextjs && useradd --uid 1000 --gid nextjs --system --shell /bin/bash --create-home nextjs)

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies as root, then fix permissions
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Create cache directories and set proper ownership for Talos OS
RUN mkdir -p .next/cache/fetch-cache .next/cache/images && \
    chown -R nextjs:nextjs /app && \
    chmod -R 755 /app

# Switch to non-root user before runtime
USER 1000:1000

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
