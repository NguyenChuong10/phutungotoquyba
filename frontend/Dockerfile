FROM node:22-alpine
WORKDIR /app

# Install the application dependencies
COPY package*.json ./
RUN npm install


# Copy in the source code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Setup an app user so the container doesn't run as the root user
# RUN useradd app
# USER app

CMD ["npm", "run", "start"]