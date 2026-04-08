FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    nodejs \
    npm \
    && docker-php-ext-install pdo_pgsql pgsql zip pcntl opcache intl exif \
    && npm install -g mjml \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Composer auth for Satis (Spatie Mailcoach)
ARG SATIS_USERNAME
ARG SATIS_PASSWORD
RUN mkdir -p /root/.composer && \
    if [ -n "$SATIS_USERNAME" ] && [ -n "$SATIS_PASSWORD" ]; then \
    echo "{\"http-basic\":{\"satis.spatie.be\":{\"username\":\"$SATIS_USERNAME\",\"password\":\"$SATIS_PASSWORD\"}}}" > /root/.composer/auth.json; \
    fi

# Install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application
COPY . .
RUN composer run-script post-autoload-dump

# Build Filament and Mailcoach assets
RUN php artisan filament:assets \
    && php artisan mailcoach:publish

# Deploy configs
COPY deploy/nginx.conf /etc/nginx/sites-available/default
COPY deploy/supervisord.conf /etc/supervisor/conf.d/app.conf
COPY deploy/php-fpm.conf /usr/local/etc/php-fpm.d/zz-custom.conf
COPY deploy/entrypoint.sh /entrypoint.sh

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
