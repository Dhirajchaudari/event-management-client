# Onference Event Studio — Frontend

Next.js App Router client for the OnferenceTV event management assignment. Built with **Radix UI** primitives, a custom editorial design system, and cookie-based GraphQL auth.

## Stack

- **Next.js 16** (App Router)
- **Radix UI** — Dialog, Dropdown, Toast, Alert Dialog, Avatar, Label
- **Tailwind CSS v4** — custom dark theme (amber + teal accents)
- **Zustand** — auth + toast state
- **fetch** GraphQL client with `credentials: "include"`

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/graphql` |
| Production | `https://api-events.orbitalops.net/graphql` |

### API prerequisites

From the server repo:

```bash
npm run seed:admin
npm run dev
```

Set Cloudinary vars in server `.env` (same account as product-farming). Speaker photos upload to `onference-events/speakers`.

Default admin: `admin@orbitalops.net` / `EventAdmin@123`

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/events` | Event lineup dashboard (CRUD) |

## Production

- Frontend: `https://events.orbitalops.net` (Vercel)
- API: `https://api-events.orbitalops.net/graphql`
- Ensure `CORS_ORIGINS` on the API includes the frontend origin

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
