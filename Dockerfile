# Use Node.js 18 LTS
FROM node:18-slim

# Install necessary packages for Puppeteer (minimal for Render free tier)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (Puppeteer will download Chromium)
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directory for WhatsApp session (fallback)
RUN mkdir -p whatsapp-session

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]