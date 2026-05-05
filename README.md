# Website Cloner Frontend

Clean, modern UI for the Website Cloner service. Extract HTML, CSS, and JavaScript from any website.

## Features

- ✅ Simple, intuitive interface
- ✅ Live preview of cloned websites
- ✅ Syntax-highlighted code display
- ✅ Copy to clipboard functionality
- ✅ Download individual files (HTML, CSS, JS)
- ✅ Works with separate backend deployment

## Prerequisites

- Node.js 18+ (for development)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Development Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Configuration

Create a `.env` file for development:

```env
REACT_APP_BACKEND_URL=http://localhost:3000/api
```

**Key:** Environment variables must be prefixed with `REACT_APP_` to be accessible in the browser.

## Deployment to Vercel

### 1. Push Frontend to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/website-cloner-frontend
git push -u origin main
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

**During setup:**
- Select the GitHub repository
- Project Type: Static Site
- Build Command: (leave empty - static files only)

### 3. Configure Backend URL

In Vercel Dashboard:
- Project Settings → Environment Variables
- Add: `REACT_APP_BACKEND_URL` = `https://your-backend.vercel.app/api`

### 4. Redeploy

After setting environment variables, redeploy:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://backend.vercel.app/api` |
| `REACT_APP_API_URL` | Base API URL | `https://backend.vercel.app` |

## How It Works

1. User enters a website URL
2. Frontend sends to backend API
3. Backend clones the website and extracts files
4. Results displayed with preview and code tabs
5. User can copy/download individual files

## File Structure

```
frontend/
├── public/
│   ├── index.html      # Main UI
│   └── script.js       # Frontend logic with env var support
├── package.json
├── vercel.json        # Vercel configuration
├── .env.example       # Example environment variables
└── README.md          # This file
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Static site (no build required)
- ~50KB gzipped
- Instant loading from Vercel CDN

## Troubleshooting

**Backend connection errors:**
- Check `REACT_APP_BACKEND_URL` in browser console
- Ensure backend is running and accessible
- Check CORS settings on backend

**Preview not loading:**
- Clear browser cache
- Check browser console for errors
- Try downloading HTML file instead

**Large website timeout:**
- Website may be too complex
- Some SPAs require more processing time
- Try a simpler website first

## Tips

- Use browser DevTools to debug API calls
- Check Network tab to see request/response
- Console shows detailed logging information

## Support

For issues or questions, open an issue on GitHub.
