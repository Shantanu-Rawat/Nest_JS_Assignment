# Stage 1: Install dependencies and run tests
FROM node:22-alpine AS test
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the entire app source
COPY . .

# Ensure uploads directory is present
RUN mkdir -p /app/uploads

# Run test cases
RUN npm run test

# Stage 2: Build application after successful tests
FROM node:22-alpine AS builder
WORKDIR /app

# Copy only the tested code and node modules
COPY --from=test /app/node_modules ./node_modules
COPY --from=test /app .

# Build the application
RUN npm run build

# Stage 3: Production-ready container
FROM node:22-alpine AS production
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Set the start command
CMD ["node", "dist/main.js"]
