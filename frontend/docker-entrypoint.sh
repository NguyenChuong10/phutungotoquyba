#!/bin/sh
set -e

echo "🚀 [Runtime ENV] Đang đồng bộ các biến NEXT_PUBLIC vào bundle..."

# 1. Đồng bộ API URL
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|https://be.phutungotoquyba.buiduchieu.id.vn/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_api_url/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://localhost:5000/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://42.118.98.35:5000/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
fi

# 2. Đồng bộ SITE URL
if [ -n "$NEXT_PUBLIC_SITE_URL" ]; then
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_site_url|${NEXT_PUBLIC_SITE_URL}|g" {} +
fi

# 3. Đồng bộ UPLOADS DESTINATION (Khắc phục lỗi getaddrinfo baked_uploads_destination)
if [ -n "$NEXT_PUBLIC_UPLOADS_DESTINATION" ]; then
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_uploads_destination/uploads/:path\*|${NEXT_PUBLIC_UPLOADS_DESTINATION}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_uploads_destination|http://phutungotoquyba-be:5000|g" {} +
fi

echo "✅ [Runtime ENV] Đồng bộ hoàn tất! Khởi chạy ứng dụng..."
exec "$@"