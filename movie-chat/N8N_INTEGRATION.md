# n8n Workflow Integration Guide

## Overview
This guide explains how to connect your n8n workflow to the movie chat frontend.

## Step 1: Set Up n8n Webhook

### 1.1 Add Webhook Node (Start)

In your n8n workflow, add a **Webhook** node at the beginning:

- **Node Type:** `Webhook`
- **HTTP Method:** `POST`
- **Path:** `movie-chat` (or your preferred path)
- **Response Mode:** `Last Node`
- **Options:**
  - ✅ Respond when workflow executes: **Unchecked** (we'll respond at the end)

### 1.2 Extract Message from Request

Add a **Code** node after the Webhook to extract the message:

```javascript
// Extract message from request body
const body = $input.first().json.body || $input.first().json;
const userMessage = body.message || body.text || JSON.stringify(body);

return [{
  json: {
    "What movie are you looking for?": userMessage,
    originalMessage: userMessage,
    timestamp: new Date().toISOString()
  }
}];
```

Connect this to your existing `normalize_user_input` node.

### 1.3 Format Response for Frontend

At the end of your workflow (after "Title format" node), add a **Code** node to format the response:

```javascript
// Get all titles from previous node
const titles = $json.allTitles || [];
const titlesString = $json.titlesString || titles.join(", ");

// Format response for frontend
return [{
  json: {
    message: titlesString 
      ? `I found ${titles.length} movie${titles.length !== 1 ? 's' : ''} for you: ${titlesString}`
      : "I couldn't find any movies matching your request.",
    titlesString: titlesString,
    allTitles: titles,
    success: titles.length > 0
  }
}];
```

### 1.4 Add Respond to Webhook Node

Add a **Respond to Webhook** node as the final node:

- **Node Type:** `Respond to Webhook`
- **Response Code:** `200`
- **Response Headers:**
  - `Content-Type`: `application/json`
  - `Access-Control-Allow-Origin`: `*` (for CORS)
- **Response Body:**
  - **Response Body Source:** `JSON`
  - **Response Body:**
```json
{
  "message": "{{ $json.message }}",
  "titlesString": "{{ $json.titlesString }}",
  "allTitles": {{ JSON.stringify($json.allTitles) }},
  "success": {{ $json.success }}
}
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the `movie-chat` directory:

```env
# Your n8n webhook URL
# Format: https://your-n8n-instance.com/webhook/movie-chat
# Or if using ngrok: https://your-ngrok-url.ngrok.io/webhook/movie-chat
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/movie-chat

# Alternative: Use NEXT_PUBLIC_ prefix if you need it in the browser
# NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/movie-chat
```

## Step 3: Get Your n8n Webhook URL

1. **If using n8n Cloud:**
   - Your webhook URL will be: `https://your-workspace.n8n.cloud/webhook/movie-chat`

2. **If using self-hosted n8n:**
   - Your webhook URL will be: `https://your-domain.com/webhook/movie-chat`

3. **If using ngrok (local development):**
   ```bash
   ngrok http 5678
   ```
   - Your webhook URL will be: `https://your-ngrok-url.ngrok.io/webhook/movie-chat`
   - Make sure your n8n workflow is **Active**

## Step 4: Test the Integration

### Test the Webhook Directly

```bash
curl -X POST https://your-n8n-instance.com/webhook/movie-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want a sci-fi movie from the 90s"}'
```

Expected response:
```json
{
  "message": "I found 5 movies for you: The Matrix, Blade Runner, Total Recall",
  "titlesString": "The Matrix, Blade Runner, Total Recall",
  "allTitles": ["The Matrix", "Blade Runner", "Total Recall"],
  "success": true
}
```

### Test from Frontend

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Type a message like: "I want a sci-fi movie from the 90s"

4. The frontend should display the movie recommendations

## Step 5: Enhanced Response Format (Optional)

To return more detailed movie information, update your n8n workflow's final Code node:

```javascript
// Enhanced response with movie details
const results = $input.all();
const movies = results.map((item, index) => ({
  id: `movie-${index}-${Date.now()}`,
  title: item.json.title || 'Unknown',
  year: item.json.year || item.json.release_year || new Date().getFullYear(),
  poster: item.json.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.json.poster_path}` 
    : null,
  description: item.json.overview || item.json.description || '',
  rating: item.json.vote_average || item.json.rating || 8.0,
}));

const titles = movies.map(m => m.title);
const titlesString = titles.join(", ");

return [{
  json: {
    message: `I found ${movies.length} movie${movies.length !== 1 ? 's' : ''} for you!`,
    titlesString: titlesString,
    allTitles: titles,
    movies: movies, // Enhanced format with full movie data
    success: movies.length > 0
  }
}];
```

## Troubleshooting

### Issue: "N8N webhook URL not configured"
- Make sure you've created `.env.local` with `N8N_WEBHOOK_URL`
- Restart your Next.js dev server after adding environment variables

### Issue: "N8N request failed"
- Check that your n8n workflow is **Active**
- Verify the webhook URL is correct
- Check n8n execution logs for errors

### Issue: No movies showing
- Check the n8n response format matches expected structure
- Verify `allTitles` or `titlesString` is in the response
- Check browser console for errors

### Issue: CORS errors
- Make sure the `Respond to Webhook` node includes CORS headers
- Or configure CORS in your n8n instance settings

## Workflow Structure

```
Webhook (POST)
  ↓
Extract Message (Code)
  ↓
normalize_user_input
  ↓
[Your existing workflow...]
  ↓
Title format
  ↓
Format Response (Code) - Optional
  ↓
Respond to Webhook
```

## Next Steps

1. ✅ Set up webhook node in n8n
2. ✅ Configure environment variables
3. ✅ Test webhook directly
4. ✅ Test from frontend
5. 🔄 Enhance response format (optional)
6. 🔄 Add error handling
7. 🔄 Add loading states
8. 🔄 Add movie details fetching (TMDB API)



