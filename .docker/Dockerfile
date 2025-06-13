FROM serversideup/php:8.4-fpm-nginx-alpine

# Enable OPCache
ENV PHP_OPCACHE_ENABLE=1

# Install Required software
USER root

RUN apk add --update nodejs npm

COPY --chown=www-data:www-data . /var/www/html

# Setup Application
USER www-data

WORKDIR /var/www/html

RUN composer install --no-dev --prefer-dist --no-interaction

RUN npm install && npm run build
