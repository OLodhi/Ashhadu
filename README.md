# Ashhadu Islamic Art

A luxury e-commerce website for premium 3D printed Islamic calligraphy and art pieces.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom luxury design system
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth

## Features

- 🎨 Luxury Islamic art product catalog
- 🛒 Shopping cart with persistent state
- 👤 Customer authentication and accounts
- 📦 Order management system
- 🎯 Admin dashboard for product management
- 🌍 UK-focused e-commerce (GBP, VAT)
- 📱 Fully responsive design

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/OLodhi/Ashhadu.git
cd Ashhadu
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Set up the database:
- Create a new Supabase project
- Run the SQL schema from `supabase-schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── contexts/         # React contexts (Auth)
├── lib/             # Utilities and configurations
├── store/           # Zustand stores
└── types/           # TypeScript type definitions
```

## Deployment

See `DEPLOYMENT_CHECKLIST.md` for production deployment instructions.

## License

All rights reserved. This is proprietary software for Ashhadu Islamic Art.