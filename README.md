# Finish MVP

Finish is a mobile-first SNS for recording URL content that felt worth finishing. Each post updates a lightweight Taste DNA profile so the value of posting is visible to the user.

## File Structure

```text
finish/
  src/app/                  Next.js App Router pages and API routes
  src/app/api/metadata/     Open Graph metadata API
  src/components/           Product UI and shadcn-style primitives
  src/lib/                  Supabase clients, data access, metadata, Taste DNA logic
  src/types/                App and Supabase database types
  supabase/schema.sql       Tables, triggers, views, RLS policies
```

## Supabase SQL

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `posts`
- `likes`
- `bookmarks`
- `taste_dna`
- `post_stats` and `profile_stats` views
- profile creation trigger for new auth users
- Row Level Security policies

## Environment Variables

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

When Supabase variables are empty, the app runs in demo mode with sample posts and profiles.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Vercel Deployment

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Push this project to GitHub.
4. Import the repository in Vercel.
5. Add the environment variables listed above.
6. Deploy.
7. In Supabase Auth settings, add the Vercel domain to allowed redirect URLs.

## MVP Features

- Email signup/login with Supabase Auth
- 5-second Finish form: URL, rating, optional comment
- `POST /api/metadata` Open Graph metadata extraction
- Platform detection for YouTube, TikTok, X, note, Instagram, and Web
- Timeline cards with rating, metadata, tags, likes, and saves
- Profile stats: total Finish count, average rating, valuable time, top categories/platforms
- Taste DNA scoring and bar visualization
- Public Taste Profile page with taste type and match rate
- Search by keyword, platform, category, and tag
- Bookmarks page
- Discover page for users with nearby Taste DNA
- Demo mode when Supabase is not configured

## Next Features To Add

- Real OpenAI classification for category, tags, duration, and Taste DNA deltas
- Profile editing with avatar upload
- Infinite timeline pagination
- Post deletion/editing
- Better OG extraction for YouTube/TikTok APIs
- Notifications for likes/bookmarks
- Taste-based recommendation feed
- Report/block moderation flow
- Test suite for scoring, metadata extraction, and RLS-sensitive actions
