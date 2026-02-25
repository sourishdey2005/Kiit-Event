# KIIT EventSphere

This is a NextJS-based Smart Campus Event & Society Management System.

## Getting Started

1. **Setup Backend**: Run the Master SQL scripts provided in the conversation in your Supabase SQL Editor.
2. **Environment Variables**: Ensure your `.env` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Run Locally**:
   ```bash
   npm run dev
   ```

## Deployment / Git Push

To push your latest changes to your repository:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

## Features
- **Student Dashboard**: Discover events, register, and view tickets.
- **Society Admin**: Create events, use AI for descriptions, and track attendance.
- **Super Admin**: Approve events, manage societies, and view system-wide analytics.
