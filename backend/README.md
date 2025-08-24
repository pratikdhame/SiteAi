# Bolt Backend - Vercel Deployment

This is a Node.js backend for the Bolt AI code generation tool, configured for deployment on Vercel.

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your GEMINI_API_KEY
4. For local development: `npm run dev`
5. For deployment: `npm run deploy`

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key

## API Endpoints

- `POST /template` - Determines project type (node/react) and returns appropriate prompts
- `POST /chat` - Handles chat messages with the AI model

## Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Set environment variable: `vercel env add GEMINI_API_KEY`
4. Deploy: `vercel --prod`