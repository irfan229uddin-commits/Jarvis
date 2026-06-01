// Simple PWA frontend glue for JARVIS
const API_BASE = '/api'; // backend should be hosted on same origin or CORS enabled
const messagesEl = document.getElementById('messages');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const ttsPlayer = document.getElementById('ttsPlayer');

let conversation = [];
let clientToken = null; // device token will be fetched from /api/register

async function registerDevice() {
  try {
    const res = await fetch(`${API_BASE}/register`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      clientToken = data.clientToken;
      console.log('Device registered');
    }
  } catch (e) { console.warn('register failed', e); }
}

function appendMessage(role, text) {
  const d = document.createElement('div'); d.className = 'msg ' + (role==='user'?'user':'ai');
  d.textContent = (role==='user'? 'You: ' : 'JARVIS: ') + text;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = textInput.value.trim(); if (!text) return;
  appendMessage('user', text);
  conversation.push({ role: 'user', content: text });
  textInput.value = '';

  appendMessage('ai', '...processing');
  try {
    const chatRes = await fetch(`${API_BASE}/chat`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        'x-client-token': clientToken || ''
      },
      body: JSON.stringify({ messages: conversation })
    });
    if (!chatRes.ok) throw new Error('chat error ' + chatRes.status);
    const data = await chatRes.json();
    // remove the last placeholder
    const last = messagesEl.lastChild; if (last && last.textContent && last.textContent.includes('...processing')) last.remove();

    const reply = data.text || data.reply || 'No response.';
    conversation.push({ role: 'assistant', content: reply });
    appendMessage('assistant', reply);

    // Request server-side TTS (stream) and play it
    const ttsRes = await fetch(`${API_BASE}/tts`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        'x-client-token': clientToken || ''
      }, body: JSON.stringify({ text: reply })
    });
    if (ttsRes.ok) {
      const blob = await ttsRes.blob();
      const url = URL.createObjectURL(blob);
      ttsPlayer.src = url; ttsPlayer.hidden = false; ttsPlayer.play();
    }
  } catch (err) {
    console.error(err);
    appendMessage('assistant', `Error: ${err.message}`);
  }
}

sendBtn.addEventListener('click', sendMessage);
textInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });

// Init: register device and show welcome
(async ()=>{ await registerDevice(); appendMessage('assistant', 'J.A.R.V.I.S. ready.'); })();
