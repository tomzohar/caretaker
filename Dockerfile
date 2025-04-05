# Build stage
FROM --platform=linux/amd64 node:20.18.3 AS builder

# Install nx globally
RUN npm install -g nx@20.4.4

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the workspace
COPY . .

# Build the backend application
RUN nx build caretaker-backend --configuration=production

# Production stage
FROM --platform=linux/amd64 node:20.18.3

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/dist/apps/caretaker-backend ./
COPY --from=builder /app/package.json ./

# Install production dependencies only
RUN npm install --only=production

# Expose the application port
EXPOSE 3333

# Start the application
CMD ["node", "main.js"] 