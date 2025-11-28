#!/bin/bash

# Authentication Setup Script for Volcabulary
# This script helps you set up authentication with NextAuth.js

set -e

echo "🔐 Volcabulary Authentication Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp apps/web/.env.local.example apps/web/.env.local

    # Generate NEXTAUTH_SECRET
    echo "🔑 Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)

    # Update the .env.local file with the generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|your-super-secret-key-change-this-in-production|$SECRET|" apps/web/.env.local
    else
        # Linux
        sed -i "s|your-super-secret-key-change-this-in-production|$SECRET|" apps/web/.env.local
    fi

    echo "✅ .env.local created with auto-generated NEXTAUTH_SECRET"
    echo ""
    echo "⚠️  Please update the following in apps/web/.env.local:"
    echo "   - DATABASE_URL (if not using default Docker setup)"
    echo "   - GOOGLE_CLIENT_ID (if using Google OAuth)"
    echo "   - GOOGLE_CLIENT_SECRET (if using Google OAuth)"
    echo ""
else
    echo "⚠️  .env.local already exists. Skipping creation."
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker to use the database."
    echo "   You can start the database manually with: docker-compose up -d"
    echo ""
    exit 1
fi

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run Prisma migrations
echo "📊 Running database migrations..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Authentication setup complete!"
echo ""
echo "Next steps:"
echo "1. Update apps/web/.env.local with your Google OAuth credentials (optional)"
echo "2. Start the development servers: pnpm dev"
echo "3. Visit http://localhost:3000/auth/signup to create an account"
echo ""
echo "For more information, see AUTH_SETUP.md"
