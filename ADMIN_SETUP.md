# Ukalism Real Estate Admin Setup

The website now has a protected admin portal at `/admin` backed by Supabase Auth + Postgres Row Level Security.

## 1. Create a Supabase project

Create a project in Supabase, then open **SQL Editor**.

## 2. Configure the admin email in the SQL

Open `supabase/schema.sql` and replace every occurrence of:

`YOUR_ADMIN_EMAIL`

with the exact email address you will use for the Ukalism admin account.

Run the complete SQL script.

## 3. Create the admin account

In Supabase, open **Authentication → Users** and create the single admin user with the same email configured above and a strong password.

Do not publish the password or place it in the repository.

The database policies are the real security boundary: authenticated users whose email does not match the configured admin email cannot insert, update, or delete properties.

## 4. Add local environment variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADMIN_EMAIL=YOUR_ADMIN_EMAIL
```

Use the Supabase project URL and the **anon/public** key. Never put a Supabase service-role key in the frontend or commit it to GitHub.

## 5. Install and run

```powershell
npm install
npm run dev
```

Then open:

`http://localhost:5173/admin`

Sign in with the Supabase admin user.

## 6. Deploy on Vercel

Add the same three variables in the Vercel project's Environment Variables settings for Production (and Preview if desired), then redeploy.

## 7. How the security works

- Visitors can read published properties through the public SELECT policy.
- Supabase Auth handles the admin email/password session.
- The admin UI is available at `/admin` only after authentication.
- PostgreSQL RLS independently checks the authenticated JWT email before allowing INSERT, UPDATE, or DELETE.
- The admin email is also checked in the React UI for a better user experience, but the database RLS policies are the actual enforcement layer.
- The public website loads properties from Supabase and falls back to the existing demo listings if Supabase is unavailable.

## 8. Property management

From `/admin` you can:

- Add a property
- Edit a property
- Delete a property
- Set sale/rent status
- Set house/apartment/land category
- Add multiple image URLs
- Add description and features

Changes are stored in Supabase and become the source for the public property listings after the site reloads.
