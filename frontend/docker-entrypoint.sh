#!/bin/sh
set -e

echo "🚀 [Runtime ENV] Đang đồng bộ các biến NEXT_PUBLIC vào bundle..."

# 1. Đồng bộ API URL
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "  -> Substituing NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_api_url/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://localhost:5000/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://42.118.98.35:5000/api/v1|${NEXT_PUBLIC_API_URL}|g" {} +
fi

# 2. Đồng bộ WS URL
if [ -n "$NEXT_PUBLIC_WS_URL" ]; then
  echo "  -> Substituing NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}"
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|ws://baked_ws_url/ws|${NEXT_PUBLIC_WS_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|ws://localhost:5000/ws|${NEXT_PUBLIC_WS_URL}|g" {} +
fi

# 3. Đồng bộ SITE URL
if [ -n "$NEXT_PUBLIC_SITE_URL" ]; then
  echo "  -> Substituing NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}"
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_site_url|${NEXT_PUBLIC_SITE_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://localhost:3000|${NEXT_PUBLIC_SITE_URL}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://42.118.98.35:3000|${NEXT_PUBLIC_SITE_URL}|g" {} +
fi

# 4. Đồng bộ UPLOADS DESTINATION
if [ -n "$NEXT_PUBLIC_UPLOADS_DESTINATION" ]; then
  echo "  -> Substituing NEXT_PUBLIC_UPLOADS_DESTINATION=${NEXT_PUBLIC_UPLOADS_DESTINATION}"
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_uploads_destination/uploads/:path\*|${NEXT_PUBLIC_UPLOADS_DESTINATION}|g" {} +
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|http://baked_uploads_destination|http://phutungotoquyba-be:5000|g" {} +
fi

echo "✅ [Runtime ENV] Đồng bộ hoàn tất! Khởi chạy ứng dụng..."
exec "$@"