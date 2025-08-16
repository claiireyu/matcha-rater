#!/bin/bash

echo "🚀 Setting up Matcha Quality Analyzer..."

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp server/env.example server/.env
    echo "✅ Server .env file created. Please edit server/.env with your database credentials."
else
    echo "✅ Server .env file already exists."
fi

if [ ! -f "my-react-app/.env" ]; then
    echo "📝 Creating React app environment file..."
    cp my-react-app/env.example my-react-app/.env
    echo "✅ React app .env file created. Please edit my-react-app/.env with your Gemini API key."
else
    echo "✅ React app .env file already exists."
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit server/.env with your PostgreSQL database credentials"
echo "2. Edit my-react-app/.env with your Gemini API key"
echo "3. Make sure PostgreSQL is running and create a 'matcha' database"
echo "4. Run 'npm install' in both server/ and my-react-app/ directories"
echo "5. Start the server: cd server && npm start"
echo "6. Start the React app: cd my-react-app && npm run dev"
echo ""
echo "⚠️  IMPORTANT: Never commit .env files with real credentials!"
