# All Good

A mobile-first medical report analyzer built with Next.js. Upload medical reports (PDF/images), get AI-powered analysis in simple language, compare reports over time, and chat with an AI assistant about the results.

## Features

- **Report Library** — Upload, store, rename, and delete medical reports
- **AI Analysis** — One-tap analysis with structured, color-coded cards (findings, diet, treatment, etc.)
- **Report Comparison** — Pick any two analyzed reports to see what changed (better/worse/same)
- **Chat Assistant** — Ask questions about individual reports or all reports at once
- **Dark Mode** — Toggle between light and dark themes
- **Multi-Patient** — Manage reports for multiple patients

## Tech Stack

- **Frontend** — Next.js 16, React 19, Tailwind CSS
- **Backend** — Next.js API Routes
- **Database** — Neon Postgres (`@neondatabase/serverless`)
- **AI** — OpenAI GPT-4o (analysis, comparison, chat, OCR)
- **Hosting** — Vercel

## Deploy on Vercel

### 1. Push to GitHub

Make sure your code is pushed to a GitHub repository.

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **All-Good** repository
4. Framework will be auto-detected as **Next.js**

### 3. Add Environment Variables

Before clicking Deploy, add these in the **Environment Variables** section:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon Postgres connection string |
| `OPENAI_API_KEY` | Your OpenAI API key |

### 4. Deploy

Click **Deploy** — Vercel handles the rest. Your app will be live in under a minute.

## Local Development

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.local.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT
