<?php
// Clear the database cache table before Laravel boots
// Prevents Mailcoach stale serialized object errors
try {
    $pdo = new PDO(
        sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST'), getenv('DB_PORT'), getenv('DB_DATABASE')),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    $pdo->exec('DELETE FROM cache');
    echo "Cache cleared.\n";
} catch (Exception $e) {
    echo "Cache clear skipped: " . $e->getMessage() . "\n";
}
