# Webpage Builder

AI-powered mobile webpage builder. Generates mobile pages with cards, slides, and custom fonts using Mistral AI.

---

## Deploy to Vercel (step by step)

### Step 1 — Push to GitHub
Upload this folder to a new GitHub repository.

### Step 2 — Connect to Vercel
1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click Deploy

### Step 3 — Add Environment Variables
In Vercel: Project Settings > Environment Variables

Add these two variables:

| Name | Value |
|------|-------|
| `MISTRAL_API_KEY` | Your key from console.mistral.ai |
| `BLOB_READ_WRITE_TOKEN` | See Step 4 below |

### Step 4 — Set up Vercel Blob Storage
This is needed for the Publish feature (gives each page a live URL).

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** > choose **Blob**
3. Give it a name (e.g. "pages") and click Create
4. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables

### Step 5 — Redeploy
After adding environment variables, go to Deployments > click the three dots on the latest deployment > Redeploy.

---

## Features
- 🔨 **Build** — Prompt + image upload, AI generates mobile webpage
- 📱 **Preview** — Phone frame preview, refine with follow-up prompts, undo/redo
- 🎨 **Templates** — AI-generated templates across 10 categories
- **Aa Fonts** — 13 Google Fonts with live preview + 8 color palettes
- 📤 **Export** — ZIP download, publish to live URL, copy HTML, history

## Environment Variables
- `MISTRAL_API_KEY` — Server-side only, never exposed to browser
- `BLOB_READ_WRITE_TOKEN` — Added automatically by Vercel Blob setup

## Notes
- Mistral uses `pixtral-large-latest` when images are uploaded, `mistral-large-latest` otherwise
- Published pages are stored in Vercel Blob and served at `/p/your-slug`
- ZIP exports include `index.html` + `images/` folder with relative paths
