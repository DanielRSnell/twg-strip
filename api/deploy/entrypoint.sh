#!/bin/sh
set -e

cd /var/www/html

echo "Clearing stale cache from database..."
php -r "
try {
    \$pdo = new PDO(
        sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST'), getenv('DB_PORT'), getenv('DB_DATABASE')),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$pdo->exec('DELETE FROM cache');
    echo \"Cache table cleared.\n\";
} catch (Exception \$e) {
    echo \"Cache clear skipped: \" . \$e->getMessage() . \"\n\";
}
"

echo "Running migrations..."
php artisan migrate --force

echo "Caching routes and views..."
php artisan route:cache
php artisan view:cache

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
