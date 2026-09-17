# Use official Microsoft Playwright image with browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.48.0-noble

# Set working directory inside container
WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY tsconfig.json ./
COPY playwright.config.ts ./

# Install npm dependencies
RUN npm ci

# Copy framework source code
COPY core/ ./core/
COPY pages/ ./pages/
COPY tests/ ./tests/
COPY testdata/ ./testdata/
COPY utils/ ./utils/
COPY .env ./
COPY credentials.json ./

# Create output directories
RUN mkdir -p reports logs

# Set default execution command
CMD ["npm", "run", "test:api"]
