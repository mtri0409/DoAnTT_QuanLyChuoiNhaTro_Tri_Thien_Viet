FROM node:22-alpine

WORKDIR /app

# Copy package configuration files
COPY package.json package-lock.json ./

# Install project dependencies without running package lifecycle scripts
# to avoid failing builds when optional download steps (for example ngrok) are blocked.
RUN npm install --ignore-scripts

# Copy application source code
COPY server.js .env* ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
