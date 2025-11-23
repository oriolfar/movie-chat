# 🎬 CineAI - Frontend

A modern, theater-inspired chat interface for movie recommendations powered by n8n workflows and AI. This is the frontend application for CineAI.

## Features

- 🎬 Beautiful, responsive chat UI with cinema-inspired design
- 🤖 AI-powered movie recommendations via n8n workflows
- 🎨 Modern glassmorphism design with smooth animations
- 📱 Fully responsive for all devices
- ⚡ Real-time movie recommendations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An active n8n workflow with a webhook endpoint
- (Optional) ngrok for local n8n testing

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure n8n webhook URL:**
   
   Create a `.env.local` file in the root directory:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/movie-chat
   ```
   
   For local development with ngrok:
   ```env
   N8N_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/webhook/movie-chat
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## n8n Integration

This frontend connects to an n8n workflow to get movie recommendations. 

### Required n8n Workflow Setup

Your n8n workflow should:

1. **Accept POST requests** at `/webhook/movie-chat`
2. **Receive** a JSON body with `{ "message": "user query" }`
3. **Return** a JSON response with:
   ```json
   {
     "message": "Response text",
     "titlesString": "Movie 1, Movie 2, Movie 3",
     "allTitles": ["Movie 1", "Movie 2", "Movie 3"],
     "success": true
   }
   ```

### Detailed Integration Guide

See [N8N_INTEGRATION.md](./N8N_INTEGRATION.md) for complete setup instructions.

### Quick Test

Test your n8n webhook directly:
```bash
curl -X POST https://your-n8n-instance.com/webhook/movie-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want a sci-fi movie from the 90s"}'
```

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # API route that connects to n8n
│   │   ├── page.tsx              # Main page
│   │   └── layout.tsx            # Root layout
│   └── components/
│       ├── Chat.tsx               # Main chat component
│       └── MovieCard.tsx         # Movie card display component
├── public/                       # Static assets
├── N8N_INTEGRATION.md            # Detailed n8n setup guide
└── README.md                     # This file
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_WEBHOOK_URL` | Your n8n webhook endpoint | `https://workspace.n8n.cloud/webhook/movie-chat` |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | Alternative (for browser access) | Same as above |

## Troubleshooting

### "N8N webhook URL not configured"
- Make sure `.env.local` exists with `N8N_WEBHOOK_URL`
- Restart the dev server after adding environment variables

### "N8N request failed"
- Verify your n8n workflow is **Active**
- Check the webhook URL is correct
- Review n8n execution logs

### No movies showing
- Check browser console for errors
- Verify n8n response includes `allTitles` or `titlesString`
- Test webhook directly with curl

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## Deploy

### Deploy on Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `N8N_WEBHOOK_URL` environment variable
4. Deploy!

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
