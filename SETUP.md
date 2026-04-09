# The DM Toolkit — Archivist App Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase account and project
- A Vercel account (connected to GitHub)

---

## Step 1: Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Dashboard → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Dashboard → Settings → API → anon/public key
- `ANTHROPIC_API_KEY` — from console.anthropic.com (when ready)

---

## Step 2: Set Up the Database

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the editor and click **Run**

You should see "Success" — your database is now set up.

---

## Step 3: Run Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 — you should be redirected to the login page.

---

## Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "Initial scaffold: DM Toolkit Archivist app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dm-toolkit-app.git
git push -u origin main
```

---

## Step 5: Deploy to Vercel

1. Go to vercel.com/dashboard
2. Click **Add New → Project**
3. Import your GitHub repo (`dm-toolkit-app`)
4. Under **Environment Variables**, add the same values from your `.env.local`
5. Click **Deploy**

Your app will be live at `your-project.vercel.app`.

---

## Step 6: Connect Your Domain (Optional)

In Vercel → Project Settings → Domains, add `app.thedmtoolkit.com`.
Then in your DNS provider, add a CNAME record pointing `app` to `cname.vercel-dns.com`.

---

## Project Structure

```
dm-toolkit-app/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/   # Campaign list
│   │   └── campaigns/   # Campaign & session views
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout (fonts, metadata)
├── components/          # Reusable UI components
├── lib/supabase/        # Supabase client helpers
├── types/               # TypeScript types
└── supabase/migrations/ # Database schema
```
