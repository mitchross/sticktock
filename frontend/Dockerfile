# Use an official Node.js LTS base image
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies
RUN npm ci

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]