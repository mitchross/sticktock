# Use an official Node.js LTS base image
FROM node:lts

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies for Patchright/Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy project files
COPY . .

# Install project dependencies
RUN npm ci

# Install Patchright Chromium browser
RUN npx patchright install chromium

# Build the project
RUN npm run build

VOLUME /var/local/sticktock

# Expose the port the app runs on
EXPOSE 2000

# Define the command to run the application
CMD ["npm", "run", "start"]