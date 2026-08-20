# -------------------------------------------------------------
# STAGE 1: Cài đặt Dependencies (Dependencies Stage)
# -------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Check package manager và cài đặt thư viện
COPY package*.json ./
RUN npm ci

# -------------------------------------------------------------
# STAGE 2: Build Source Code (Builder Stage)
# -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Lấy node_modules từ stage deps sang
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Khai báo các Placeholder để Next.js nhúng vào code JS/HTML tĩnh lúc compile
# Đảm bảo đúng định dạng URL nhưng vẫn mang tiền tố độc nhất để sed an toàn
# Đặt placeholder chữ thường chuẩn định dạng URL
ENV NEXT_PUBLIC_API_PROTOCOL="http"
ENV NEXT_PUBLIC_API_HOSTNAME="baked_hostname"
ENV NEXT_PUBLIC_API_PORT="59999"
ENV NEXT_PUBLIC_API_URL="http://baked_api_url/api/v1"
ENV NEXT_PUBLIC_WS_URL="ws://baked_ws_url/ws"
ENV NEXT_PUBLIC_SITE_URL="http://baked_site_url"
ENV NEXT_PUBLIC_UPLOADS_DESTINATION="http://baked_uploads_destination/uploads/:path*"

# Build ứng dụng
RUN npm run build

# Dọn dẹp bỏ các devDependencies (TypeScript, Eslint, Tailwind...) chỉ giữ production packages
RUN npm prune --production

# -------------------------------------------------------------
# STAGE 3: Runner (Môi trường chạy Production siêu nhẹ)
# -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy các thư mục cần thiết để chạy npm start từ builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy script entrypoint và phân quyền thực thi
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

# Chạy thông qua entrypoint để replace ENV runtime trước khi server khởi động
ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["npm", "run", "start"]