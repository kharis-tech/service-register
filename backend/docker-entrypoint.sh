#!/bin/sh

# Wait for the database to be ready
echo "Waiting for postgres..."

# The DATABASE_URL is like postgresql://user:password@host:port/dbname
# We need to extract the host and port.
# Use shell parameter expansion for robustness.
# This removes the need for external tools like sed.
DB_CONN_STRING=${DATABASE_URL#*@}
DB_HOST=${DB_CONN_STRING%:*}
DB_PORT_AND_DBNAME=${DB_CONN_STRING#*:}
DB_PORT=${DB_PORT_AND_DBNAME%/*}

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the main application
echo "Starting application..."
exec "$@"