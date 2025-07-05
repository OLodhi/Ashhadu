#!/bin/bash

echo "🔄 Restarting Next.js development server..."

# Kill existing processes
echo "Killing existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 2

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true

# Check for TypeScript errors
echo "Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation errors found. Please fix before continuing."
    exit 1
fi

# Start the development server
echo "Starting development server on port 8080..."
npm run dev

echo "✅ Server should be available at http://localhost:8080"