# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port (adjust per service)
EXPOSE 5006

# Start the app
CMD ["node", "server.js"]
