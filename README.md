# Tasty Agenda

A meal planning app that helps you organize your week, build a shopping list automatically, and keep your favorite recipes in one place.

## What it does

- **Weekly planner** — plan breakfast, lunch, and dinner for each day. Generate a full week with one click or fill it manually. Drag meals between slots to rearrange.
- **Shopping list** — auto-generated from your weekly plan, grouped by day. Check off items as you shop.
- **Recipe book** — save your own recipes with photos, or browse and favorite dishes from MealDB.
- **Dashboard** — a quick overview of the week: meals planned, items to buy, family size, and recipe count.

## Tech stack

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- shadcn/ui components
- Supabase (auth, database, image storage)
- TanStack Query for server state
- Zustand for client state
- dnd-kit for drag & drop
- Vercel Analytics

## Getting started

**1. Clone and install**

```bash
npm install
```

**2. Set up environment variables**

Create a `.env.local` file in the root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**3. Set up Supabase**

You'll need the following tables: `profiles`, `recipes`, `weekly_plan`, `shopping_list`.
Also create a storage bucket called `recipe-images` with user-scoped RLS policies.

**4. Run locally**

```bash
npm run dev
```

**5. Build**

```bash
npm run build
```

## Project structure

```
src/
├── components/       # Shared UI components (layout, meal cards, planner grid)
├── features/         # Feature modules (auth, recipes, planner, shopping list)
├── pages/            # Route-level pages
├── hooks/            # Shared hooks
├── store/            # Zustand stores
├── types/            # TypeScript types
└── utils/            # Utilities (date helpers, etc.)
```
