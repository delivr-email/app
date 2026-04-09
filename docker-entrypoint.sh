#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push
echo "Migrations done."

exec node server.js
