# AXIOM by Glade AI

Agentic case intelligence platform for bankruptcy law firms.

3 Groq-powered AI agents analyze cases in real time:
- Document Intelligence Agent: extracts financial fields from uploaded documents
- Compliance Auditor: runs means test calculations and filing requirement checks
- Anomaly Detector: cross-references data for inconsistencies and risks
- Master Orchestrator: synthesizes all findings into a court-ready petition draft

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Groq llama-3.3-70b-versatile (800+ tokens/sec)
- Node.js serverless API (Vercel)
- pdf-lib for court-ready document generation
- Recharts for eval dashboards
- Framer Motion

## Setup

```bash
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm run dev
```

## Deploy

```bash
vercel --prod
# Set GROQ_API_KEY in Vercel environment variables
```
