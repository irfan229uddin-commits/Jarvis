const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ELEVEN_KEY = process.env.ELEVEN_API_KEY;
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN || 'changeme';

function requireKey(req, res, next) {
  const token = req.headers['x-client-token'] || req.body.clientToken;
  if (!token || token !== CLIENT_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// Simple register endpoint: in production, replace with proper device registration
app.post('/api/register', (req, res) => {
  res.json({ clientToken: CLIENT_TOKEN });
});

app.post('/api/chat', requireKey, async (req, res) => {
  try {
    const { messages } = req.body;
    // Forward to Anthropic (simple payload)
    const payload = {
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
      messages,
      max_tokens: 1000
    };
    const r = await axios.post('https://api.anthropic.com/v1/messages', payload, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANTHROPIC_KEY}` }
    });
    const reply = r.data?.content?.map(c => c.text).join('') || '';
    res.json({ text: reply });
  } catch (err) {
    console.error('chat error', err.response?.data || err.message);
    res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

// TTS streaming — ElevenLabs
app.post('/api/tts', requireKey, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'no_text' });
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}/stream`;
    const r = await axios.post(url, { text }, {
      responseType: 'stream', headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' }
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    r.data.pipe(res);
  } catch (err) {
    console.error('tts error', err.response?.data || err.message);
    res.status(500).json({ error: 'tts_error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('JARVIS backend listening on', port));
