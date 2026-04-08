#!/bin/sh
set -e

cd /var/www/html

echo "Clearing application cache..."
php artisan cache:clear
php artisan config:clear

echo "Running migrations..."
php artisan migrate --force

echo "Caching routes and views..."
php artisan route:cache
php artisan view:cache

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
