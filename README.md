# Stopwatch Plus ⏱️

A modern, cloud-synced timer application with multiple named countdown timers that persist across devices and sessions.

## Features

- 🔐 **Email-based Authentication** - Simple login with any email address
- ⏱️ **Multiple Named Timers** - Create and manage multiple countdown timers with custom names
- 🚀 **Auto-start on Creation** - Timers start automatically with 60-minute default duration
- ☁️ **Cloud Sync** - Timers sync across all your devices via Vercel API
- 💾 **Background Persistence** - Timers keep running even when you close the browser
- ⏯️ **Pause & Resume** - Full control over each timer independently
- 🔄 **Reset & Delete** - Reset timers to original duration or remove them completely
- 🔔 **Visual Alerts** - Prominent red animation and notification when timers complete
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS and smooth animations
- 💪 **Offline Fallback** - Local storage backup ensures data is never lost

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Vercel Serverless Functions
- **Storage**: Cloud sync (Vercel KV) + localStorage fallback

## How It Works

1. **Sign in** with any email address (demo mode)
2. **Create timers** by entering a name and duration (default: 60 minutes)
3. Timers **start automatically** and run in the background
4. **Pause, resume, reset, or delete** timers as needed
5. Your timers **sync across all devices** using the same email
6. **Visual alerts** notify you when any timer completes

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Deployed on Vercel with automatic deployments from GitHub.

Live URL: [https://stopwatch-plus.vercel.app/](https://stopwatch-plus.vercel.app/)

## License

MIT
