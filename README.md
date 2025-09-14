# My App

A modern web application built with Next.js and Supabase.

## Features

- Next.js 14 with App Router
- Supabase authentication with OAuth providers (Google, GitHub)
- Tailwind CSS for styling
- shadcn/ui components
- Framer Motion animations
- Dark/light theme support

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase project and configure environment variables
4. Run the development server: `npm run dev`

## Authentication

The app supports OAuth authentication through:
- Google
- GitHub

Configure these providers in your Supabase dashboard under Authentication > Providers.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.