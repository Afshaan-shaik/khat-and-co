# Supabase Database & Storage Setup for Khat & Co.

This guide walks you through connecting your Supabase project to the **Khat & Co.** application.

---

## Step 1: Run the Database & Storage SQL Setup

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your **Khat & Co.** project (associated with your GitHub or Gmail account).
3. In the left sidebar, click on **SQL Editor**.
4. Click **New query**, paste the entire contents of [`supabase/schema.sql`](../supabase/schema.sql), and click **Run**.

This automatically creates:
- **`public.letters` table**: Stores letter details (`sender`, `recipient`, `body`, `wax_seal`, `stickers`, `date`, `payload`, etc.)
- **`letters` Storage Bucket**: Stores letter JSON snapshots and master backups (`backups/khat-site-backup-*.json`).
- **Row Level Security (RLS) Policies**: Permits public access so visitors can seal and share letters without requiring complex authentication.

---

## Step 2: Retrieve your Project API Credentials

1. In your Supabase Dashboard, go to **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click on **API** in the settings menu.
3. Copy the following two values:
   - **Project URL** (e.g. `https://xyzabcdefg.supabase.co`)
   - **Project API Keys** -> `anon` / `public` (starts with `eyJ...`)

---

## Step 3: Add Environment Variables to Vercel

To have your live production Vercel app write directly to Supabase:

1. Open your [Vercel Dashboard](https://vercel.com/dashboard) and go to your **Khat & Co.** project.
2. Go to **Settings** -> **Environment Variables**.
3. Add the two variables:
   - **Key**: `VITE_SUPABASE_URL`  
     **Value**: `https://your-project-ref.supabase.co`
   - **Key**: `VITE_SUPABASE_ANON_KEY`  
     **Value**: `eyJhbGciOi...`
4. Check all environments (**Production**, **Preview**, **Development**) and click **Save**.
5. Trigger a Redeploy (or push a commit) so Vercel builds with the new variables active.

---

## Step 4: Add Environment Variables Locally (Optional)

Create a file named `.env` in the root of the project with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## How it Works in Khat & Co.

1. **Automatic Database Persistence**: When a user seals a letter, it is saved directly into your Supabase `letters` table with a clean 8-character slug.
2. **Storage Container Persistence**: A complete JSON file is written to your `letters` Storage bucket (`letters/<slug>.json`) and full site backups can be uploaded with one click.
3. **The Shelf Synchronization**: Letters on The Shelf can be retrieved directly from Supabase, so letters sent from any device appear on the shelf.
4. **Graceful Fallback**: If Supabase is ever unreachable or pending credentials, Khat & Co. automatically falls back to URL hash encoding and localStorage so users never lose a word.
