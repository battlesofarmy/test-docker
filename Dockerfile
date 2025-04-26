# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port (default 5000 or your choice)
EXPOSE 4000

# Start your server
CMD ["node", "index.js"]
