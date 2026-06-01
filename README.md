# J.A.R.V.I.S. PWA — Full package

This branch contains a Progressive Web App frontend and a sample Node.js backend for a J.A.R.V.I.S. personal assistant.

Components
- Frontend (root): index.html, app.js, sw.js, manifest.json, icons/
- Backend (server/): Node.js Express server that proxies Anthropic + ElevenLabs

Important
- API keys must be set as environment variables on the server. Do NOT put API keys in frontend code.

Required environment variables (see server/.env.example):
- ANTHROPIC_API_KEY
- ELEVEN_API_KEY
- ELEVEN_VOICE_ID
- CLIENT_TOKEN (a shared secret used by the app to register)

Hosting recommendation
- Frontend: any static HTTPS host (Vercel, Netlify, GitHub Pages with custom domain + HTTPS). For PWA install on Android, serve via HTTPS and a valid manifest.
- Backend: Render or any Node-capable host. Example Dockerfile is included.

How it works
- The PWA sends conversation messages to /api/chat on the backend.
- The backend calls Anthropic and returns text.
- The PWA then requests /api/tts to synthesize audio (ElevenLabs) — backend streams audio back and the PWA plays it.

Limitations & notes
- Browsers on Android do not allow continuous background microphone usage for PWAs. For persistent background listening, consider a native app or Trusted Web Activity wrapper.
- Keep an eye on costs for Anthropic and ElevenLabs.

See server/README for deployment details.
