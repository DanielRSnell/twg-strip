#!/bin/sh
set -e

cd /var/www/html

echo "Clearing stale cache..."
CACHE_STORE=null php artisan cache:clear 2>/dev/null || true

echo "Running migrations..."
CACHE_STORE=null php artisan migrate --force

echo "Caching routes and views..."
CACHE_STORE=null php artisan route:cache
CACHE_STORE=null php artisan view:cache

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
