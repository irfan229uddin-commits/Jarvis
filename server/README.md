# Server (Node.js) — JARVIS proxy for Anthropic + ElevenLabs

Simple Express server with two main endpoints:
- POST /register -> returns a client token (simple device registration)
- POST /chat -> proxies conversation to Anthropic
- POST /tts -> streams ElevenLabs TTS audio back to the client

Install

1. Copy .env.example to .env and fill values.
2. npm install
3. npm start

Local testing
- You can run the server locally and use ngrok to expose https for your phone during development.
