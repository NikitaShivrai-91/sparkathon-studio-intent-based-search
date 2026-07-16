FROM node:20-alpine

WORKDIR /app

# Copy package files and .npmrc
COPY package*.json .npmrc ./

# Install dependencies using public npm registry
RUN npm install --production --registry=https://registry.npmjs.org/

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
