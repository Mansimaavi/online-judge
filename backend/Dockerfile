FROM node:18-alpine

WORKDIR /app

# Install necessary build tools and Java (JDK 17)
RUN apk update && apk add --no-cache \
    g++ \
    gcc \
    libstdc++ \
    make \
    python3 \
    openjdk17-jdk

# Copy dependency files
COPY package*.json ./

# Install node dependencies
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Create necessary directories
RUN mkdir -p codes outputs uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/problems', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "server.js"]
