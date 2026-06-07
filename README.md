# Zylo

Zylo is a fullstack Gen-Z campus marketplace prototype for verified students to buy, sell, chat, wishlist, pay, track seller earnings, and manage marketplace moderation.

## Tech

- React, Vite, Tailwind CSS, Framer Motion, React Router, React Icons
- Node.js, Express, Socket.IO
- Supabase-ready auth, PostgreSQL schema, and storage placeholders
- Razorpay checkout hooks with commission and seller wallet records
- Recharts admin analytics

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:4000`.

The app starts with a clean empty marketplace. Add Supabase and Razorpay values when wiring live products, sellers, payments, and wallet records.

## Run With Supabase

1. Create a Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
3. Add your credentials to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Restart the servers with `npm run dev`.

When `SUPABASE_SERVICE_ROLE_KEY` is set, the Express API uses Supabase tables for products, listings, payment verification, wallet transactions, reports, and payouts. Without those keys, Zylo returns empty states and does not create temporary local marketplace data.
