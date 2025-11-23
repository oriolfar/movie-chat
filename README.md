# 🎬 CineAI

A modern, cinema-inspired AI-powered movie recommendation chat application. Step into your private screening room and discover films curated just for you.

![CineAI](https://img.shields.io/badge/CineAI-Movie%20AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎭 **Cinema-Inspired UI**: Beautiful glassmorphism design with theater-like atmosphere
- 🤖 **AI-Powered Recommendations**: Get personalized movie suggestions based on your preferences
- 🎨 **Modern Design**: Responsive interface with smooth animations and cinematic effects
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Real-Time Chat**: Interactive chat interface with instant movie recommendations
- 🎬 **Rich Movie Data**: Detailed movie information including posters, ratings, and descriptions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- An active n8n workflow with a webhook endpoint
- (Optional) ngrok for local n8n testing

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fliming
   ```

2. **Navigate to the movie-chat directory:**
   ```bash
   cd movie-chat
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment variables:**
   
   Create a `.env.local` file in the `movie-chat` directory:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/movie-chat
   ```
   
   For local development with ngrok:
   ```env
   N8N_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/webhook/movie-chat
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
fliming/
├── movie-chat/              # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── chat/
│   │   │   │       └── route.ts      # API route connecting to n8n
│   │   │   ├── page.tsx              # Main page
│   │   │   └── layout.tsx            # Root layout
│   │   └── components/
│   │       ├── Chat.tsx               # Main chat component
│   │       ├── MovieCard.tsx         # Movie card display component
│   │       └── ui/                    # shadcn/ui components
│   ├── N8N_INTEGRATION.md            # Detailed n8n setup guide
│   └── README.md                      # Frontend-specific documentation
├── n8n/                              # n8n workflow configuration
│   ├── Dockerfile
│   └── railway.json
└── README.md                          # This file
```

## 🔌 n8n Integration

This application connects to an n8n workflow to get movie recommendations. The frontend sends user queries to the n8n webhook, which processes them and returns movie recommendations.

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
     "movies": [
       {
         "id": "movie-id",
         "title": "Movie Title",
         "year": 2023,
         "poster": "https://image.tmdb.org/t/p/w500/poster.jpg",
         "description": "Movie description",
         "rating": 8.5,
         "score": 25
       }
     ],
     "success": true
   }
   ```

### Detailed Integration Guide

See [movie-chat/N8N_INTEGRATION.md](./movie-chat/N8N_INTEGRATION.md) for complete setup instructions.

### Quick Test

Test your n8n webhook directly:
```bash
curl -X POST https://your-n8n-instance.com/webhook/movie-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want a sci-fi movie from the 90s"}'
```

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_WEBHOOK_URL` | Your n8n webhook endpoint | `https://workspace.n8n.cloud/webhook/movie-chat` |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | Alternative (for browser access) | Same as above |

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build cache
- `npm run clean:dev` - Clean cache and start dev server

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend Integration**: n8n workflows

## 🚢 Deployment

### Deploy on Railway

1. Push your code to GitHub
2. Create a new project in [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add `N8N_WEBHOOK_URL` environment variable
5. Deploy!

### Deploy on Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `N8N_WEBHOOK_URL` environment variable
4. Deploy!

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## 🐛 Troubleshooting

### "N8N webhook URL not configured"
- Make sure `.env.local` exists with `N8N_WEBHOOK_URL`
- Restart the dev server after adding environment variables

### "N8N request failed"
- Verify your n8n workflow is **Active**
- Check the webhook URL is correct
- Review n8n execution logs

### No movies showing
- Check browser console for errors
- Verify n8n response includes `allTitles` or `movies` array
- Test webhook directly with curl

### CORS errors
- Make sure the `Respond to Webhook` node includes CORS headers
- Or configure CORS in your n8n instance settings

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contributions are not currently accepted.

## 📧 Contact

For questions or support, please contact the project maintainer.

---

Made with ❤️ and 🎬 for movie lovers everywhere

