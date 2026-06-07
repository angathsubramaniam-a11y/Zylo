# Supabase Setup For Zylo

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run `schema.sql`.
4. Copy your project values into `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Restart the backend after changing `.env`.

When `SUPABASE_SERVICE_ROLE_KEY` is present, the Express API uses Supabase tables. Without it, Zylo returns clean empty states and does not create temporary local marketplace data.
