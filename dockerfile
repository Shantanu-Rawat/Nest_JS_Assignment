FROM node:22-alpine AS builder
WORKDIR /app

# Copy only package.json (if available)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all files (including source code)
COPY . .

# Ensure uploads directory is present
RUN mkdir -p /app/uploads

# Build the application
RUN npm run build
