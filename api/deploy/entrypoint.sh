#!/bin/sh
set -e

cd /var/www/html

echo "Clearing stale caches..."
php -r "
require '/var/www/html/vendor/autoload.php';

// Clear database cache table
try {
    \$pdo = new PDO(
        sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST'), getenv('DB_PORT'), getenv('DB_DATABASE')),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$pdo->exec('DELETE FROM cache');
    echo \"Database cache cleared.\n\";
} catch (Exception \$e) {
    echo \"DB cache skip: \" . \$e->getMessage() . \"\n\";
}

// Flush Redis
try {
    \$redis = new Predis\Client([
        'host' => getenv('REDIS_HOST'),
        'port' => getenv('REDIS_PORT'),
        'password' => getenv('REDIS_PASSWORD'),
    ]);
    \$redis->flushdb();
    echo \"Redis flushed.\n\";
} catch (Exception \$e) {
    echo \"Redis skip: \" . \$e->getMessage() . \"\n\";
}
"

echo "Running migrations..."
php artisan migrate --force

echo "Caching routes and views..."
php artisan route:cache
php artisan view:cache

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
