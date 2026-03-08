#!/bin/bash
# Note: Use Git Bash or WSL on Windows to execute this file

echo "Setting up Enterprise RAG System..."

# Create necessary directories
mkdir -p vector_db
mkdir -p data

# Copy .env.example to .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your API keys."
fi

echo "Setup complete. You can now run 'docker-compose up' to start the application."
