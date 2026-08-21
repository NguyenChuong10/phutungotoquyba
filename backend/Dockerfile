# ===================================================
# Stage 1: Build stage (Compile TypeScript to dist)
# ===================================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package dependencies and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including TypeScript devDependencies)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript code to dist/
RUN npm run build


# ===================================================
# Stage 2: Production runner (Only dist & prod modules)
# ===================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime engine
RUN apk add --no-cache openssl libc6-compat

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies & generate Prisma Client
RUN npm install --omit=dev && npx prisma generate

# Copy compiled JavaScript dist folder from builder stage (No src code exposed)
COPY --from=builder /app/dist ./dist

# Create uploads directory for runtime images/files
RUN mkdir -p uploads

# Expose server port
EXPOSE 5000

CMD ["node", "dist/index.js"]