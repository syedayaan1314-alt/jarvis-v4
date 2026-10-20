# JARVIS Hologram UI — v3

Mobile-first JARVIS-style interface with a glowing blue reactor, PIN screen, dashboard, AI chat, voice mode, tools, settings, and PWA support.

## Deploy to Vercel

1. Upload these project files to your GitHub repository. Keep `api/chat.js` inside the `api` folder.
2. In Vercel, import the repository or redeploy the connected project.
3. Open **Project → Settings → Environment Variables** and add `GEMINI_API_KEY` with your own Gemini API key. Select the environments you use.
4. Redeploy after adding/changing the environment variable.
5. Open the deployed URL on Android Chrome. Use the browser menu → **Add to Home screen** (or **Install app**, if offered).

## Run locally

This project uses a Vercel serverless function for `/api/chat`; opening `index.html` by double-clicking will show the UI, but AI chat will not work because the API endpoint is not running. For full local testing, install Node.js and Vercel CLI, then run:

```bash
npm install -g vercel
vercel dev
```

Set `GEMINI_API_KEY` in the local environment or a local `.env` file (never upload a real key to GitHub). Follow Vercel CLI prompts, then open the local URL it prints.

## Included features

- Responsive neon-blue holographic interface inspired by the supplied concept
- PIN setup, confirmation, unlock, and lock-now flow
- AI chat with Enter-to-send and Shift+Enter for a newline
- Browser speech recognition where supported and spoken AI replies
- Shortcuts to browser services, settings toggles, and installable PWA shell

## Important limitations

- The PIN is stored in this browser's local storage. It is only a convenience screen, not secure authentication; clearing browser data can reset it. Do not use it to protect sensitive information.
- The web page cannot silently control your phone, read your accounts, or perform actions in Gmail/WhatsApp/Chrome. Tool links open websites only.
- The Gemini API key must stay on the server in Vercel Environment Variables. Never place it in `app.js` or commit it to GitHub.
- Voice features depend on browser support and microphone permission.
- This project has not been deployed to your Vercel account automatically.
