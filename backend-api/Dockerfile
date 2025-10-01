# Use an official Node.js LTS base image
FROM node:lts

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Create app directory
WORKDIR /usr/src/app

# Copy project files
COPY . .

# Install project dependencies
RUN npm ci

# Install Playwright browsers and system dependencies
# Must run as root BEFORE switching to node user
# Install chromium browser for playwright-extra and system deps in one command
RUN npx playwright install --with-deps chromium

# Build the project
RUN npm run build

# Ensure runtime directories are owned by the non-root user
RUN mkdir -p /var/local/sticktock \
	&& chown -R node:node /usr/src/app /var/local/sticktock

# Drop root privileges
USER node

VOLUME /var/local/sticktock

# Expose the port the app runs on
EXPOSE 2000

# Define the command to run the application
CMD ["npm", "run", "start"]