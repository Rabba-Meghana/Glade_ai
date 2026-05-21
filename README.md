# PARALEX — Case Intelligence Platform

Agentic AI platform for bankruptcy law firms. 3 Groq-powered agents analyze cases in real time.

## Stack
- React + TypeScript + Vite + Tailwind
- Groq llama-3.3-70b-versatile (800+ tok/s)
- Vercel serverless API
- pdf-lib, Recharts, Framer Motion

## Setup
```bash
npm install
cp .env.example .env  # add GROQ_API_KEY
npm run dev
```

## Deploy
```bash
vercel --prod  # set GROQ_API_KEY in Vercel env vars
```
