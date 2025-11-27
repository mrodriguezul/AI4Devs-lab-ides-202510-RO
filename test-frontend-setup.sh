#!/bin/bash

# ATS Frontend Testing Guide
# Run this script to test all the components we set up

echo "🚀 ATS Frontend Dependency Testing"
echo "================================="
echo

# Check if backend is running
echo "1. Testing Backend Connection..."
if curl -s http://localhost:3010/api/candidates > /dev/null 2>&1; then
    echo "✅ Backend API is running on http://localhost:3010"
    echo "   Response sample:"
    curl -s http://localhost:3010/api/candidates | head -c 150
    echo "..."
    echo
else
    echo "❌ Backend API is not responding. Please start Docker containers:"
    echo "   docker compose up -d"
    echo
    exit 1
fi

# Check dependencies
echo "2. Checking Frontend Dependencies..."
cd frontend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run: npm install"
    exit 1
fi

# Check key packages
echo "   Checking key packages..."
if [ -d "node_modules/axios" ]; then
    echo "   ✅ axios - API communication"
else
    echo "   ❌ axios not found"
fi

if [ -d "node_modules/react-hook-form" ]; then
    echo "   ✅ react-hook-form - Form handling"
else
    echo "   ❌ react-hook-form not found"
fi

if [ -d "node_modules/@mui/material" ]; then
    echo "   ✅ @mui/material - UI components"
else
    echo "   ❌ @mui/material not found"
fi

if [ -d "node_modules/react-toastify" ]; then
    echo "   ✅ react-toastify - Notifications"
else
    echo "   ❌ react-toastify not found"
fi

# Check TypeScript compilation
echo
echo "3. Testing TypeScript Compilation..."
if npm run build > build.log 2>&1; then
    echo "✅ TypeScript compilation successful"
    echo "   Build artifacts created in: build/"
else
    echo "❌ TypeScript compilation failed. Check build.log"
    tail -10 build.log
fi

# Check environment configuration
echo
echo "4. Testing Environment Configuration..."
if [ -f ".env" ]; then
    echo "✅ Environment file found"
    echo "   API URL: $(grep REACT_APP_API_URL .env)"
else
    echo "❌ .env file not found"
fi

echo
echo "🎯 Manual Testing Steps:"
echo "======================="
echo "1. Start frontend: npm start"
echo "2. Open browser: http://localhost:3000"
echo "3. You should see:"
echo "   - ATS application title"
echo "   - List of candidates from backend"
echo "   - Material-UI styling"
echo "   - Toast notifications (if errors occur)"
echo
echo "📋 API Testing:"
echo "==============="
echo "Test these endpoints manually:"
echo "- GET  http://localhost:3010/api/candidates"
echo "- GET  http://localhost:3010/api/candidates/1"
echo "- POST http://localhost:3010/api/candidates (with form data)"
echo
echo "🔧 Troubleshooting:"
echo "==================="
echo "- Backend not responding: docker compose up -d"
echo "- Frontend errors: Check browser console"
echo "- CORS issues: Backend should allow localhost:3000"
echo "- Build errors: Check TypeScript types in src/"