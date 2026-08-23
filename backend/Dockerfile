FROM node:22-alpine
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install the application dependencies
COPY package*.json ./
RUN npm install


# Copy in the source code
COPY . .

# Gen prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Setup an app user so the container doesn't run as the root user
# RUN useradd app
# USER app

CMD ["npm", "run", "start"]