# Mailcoach Cache Serialization Issue

## Status: WORKAROUND IN PLACE
## Date: 2026-04-06
## Severity: Critical (blocks app boot)

## The Problem

Mailcoach's `MailcoachServiceProvider` calls `Mailer::registerAllConfigValues()` during boot, which uses `cache()->rememberForever('ready-mailers', ...)` to cache an `Illuminate\Database\Eloquent\Collection` of mailer models.

When using `php artisan serve` (PHP's built-in server), the parent process boots Laravel and caches the serialized Collection. Child processes spawned for each request attempt to unserialize this cached value, but the `Illuminate\Database\Eloquent\Collection` class isn't loaded early enough in the child's boot sequence, causing:

```
Error: The script tried to call a method on an incomplete object.
Please ensure that the class definition "Illuminate\Database\Eloquent\Collection"
of the object you are trying to operate on was loaded _before_ unserialize()
gets called or provide an autoloader to load the class definition
```

This crashes the entire application on every request.

## What We Tried (and failed)

1. **`class_exists(\Illuminate\Database\Eloquent\Collection::class)` in AppServiceProvider::register()** - Doesn't help because `php artisan serve` child processes don't inherit the parent's loaded classes.

2. **`cache()->forget('ready-mailers')` in AppServiceProvider::register()** - Cache facade isn't resolved early enough in register().

3. **`$this->app->booting()` callback to clear cache** - Same timing issue.

4. **Database cache (`CACHE_STORE=database`)** - Serialized objects in the database cache table caused the same unserialization failure. Also, the deployed app continuously repopulated the stale cache between clear operations.

5. **File cache (`CACHE_STORE=file`)** - Same serialization issue. The parent process writes the cache file, child processes can't unserialize it.

6. **Redis cache (`CACHE_STORE=redis`)** - Same fundamental problem. Also had issues with:
   - `php84Extensions.redis` doesn't exist in the Nixpacks package set
   - `php84Extensions.phpredis` also doesn't exist
   - Used `predis/predis` (pure PHP client) instead, which worked for connectivity
   - But the serialization issue persisted because the problem is in PHP's unserialize(), not the cache driver
   - The deployed app also poisoned the shared Redis with stale entries

7. **Clearing cache at startup (`clear-cache.php`)** - Worked momentarily, but subsequent artisan commands (config:cache, migrate) re-wrote the stale cache during their boot, poisoning it for the next command.

8. **`CACHE_STORE=array` for build/startup commands** - Worked for individual commands but couldn't be applied to `php artisan serve` since it needs to read runtime env vars.

9. **Removing `config:cache` from startup** - Helped partially but the app still boots and caches on the first request.

## Current Workarounds

### 1. Custom Mailer Model (`App\Models\MailcoachMailer`)
Overrides `registerAllConfigValues()` to skip `rememberForever` entirely, querying the database directly on every boot instead of caching:

```php
// config/mailcoach.php
'models' => [
    'mailer' => \App\Models\MailcoachMailer::class,
],
```

### 2. Null Cache Store (`CACHE_STORE=null`)
Disabled all caching to prevent any serialization issues. This is the nuclear option but the only one that reliably works.

### 3. Cookie Sessions (`SESSION_DRIVER=cookie`)
Since we disabled database/redis cache, sessions also can't use database (which has its own issues). Cookie sessions avoid any server-side storage.

## What's Disabled/Degraded

| Feature | Status | Impact |
|---|---|---|
| Cache store | `null` (disabled) | No application-level caching. Every query hits the DB. Acceptable for this app's scale. |
| Session driver | `cookie` | Sessions stored client-side. Limited to 4KB. Fine for admin panel auth. |
| Redis | Not used | Redis service provisioned but unused. Can be removed from Coolify. |
| Mailcoach `rememberForever` | Bypassed | Custom model queries DB on every boot. Adds ~300ms per request for mailer config. |
| Config cache | Not used at runtime | Build phase caches config with `CACHE_STORE=null`. Runtime reads .env directly. |
| Route cache | Not used at runtime | Same as config cache. |

## Proper Fix (if revisited)

The real fix would be one of:

1. **Spatie fixes the upstream issue** - Stop caching Eloquent Collections with `rememberForever`. Use a simple array or DTO instead.

2. **Use a production web server** (nginx + php-fpm) instead of `php artisan serve`. FPM workers properly initialize the autoloader before any cache reads, so unserialization works. This is the recommended production setup anyway.

3. **Use Octane** (Swoole/RoadRunner) which keeps a persistent application instance and doesn't fork child processes the way `php artisan serve` does.

## Related Files

- `api/app/Models/MailcoachMailer.php` - Custom mailer model
- `api/config/mailcoach.php` - Model override config
- `api/app/Providers/AppServiceProvider.php` - Previous workaround attempts (cleaned up)
- `api/nixpacks.toml` - Build/start configuration
- `api/clear-cache.php` - Startup cache clearing script (may be unused now)
