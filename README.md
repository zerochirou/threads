# Threads Clone

A modern, high-performance social web application inspired by Instagram Threads, built with Next.js 16 (App Router), React 19, Better Auth, and Drizzle ORM, optimized for Cloudflare Workers via OpenNext.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Proxy)
- **UI Library:** React 19, Tailwind CSS v4, Base UI, Lucide/Remixicon
- **Authentication:** [Better Auth](https://www.better-auth.com/) (Drizzle adapter, Credentials & OAuth providers)
- **Database & ORM:** Cloudflare D1 (SQLite) with [Drizzle ORM](https://orm.drizzle.team/)
- **Data Fetching:** [SWR](https://swr.vercel.app/) with optimistic caching and real-time event updates
- **Deployment:** Cloudflare Workers via [@opennextjs/cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)

## Features

- **Threads & Feed:** Create nested threads, like, reply, and bookmark posts.
- **Comment & Post Management:** Delete personal threads and comments with automated cascading and count synchronisation.
- **Protected Routing:** Edge proxy redirecting unauthenticated users to `/signin` for private interactions and pages.
- **Social & Profile:** User profile customization, bio and interest tags, follow/unfollow functionality, and follower lists.
- **Search & Discovery:** Debounced user search and follow suggestions.
- **Theme Support:** Dark and light mode toggle powered by `next-themes`.

## Getting Started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (v12.x recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Environment Variables

Copy the example environment files:

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
```

Configure your secrets:
- `BETTER_AUTH_SECRET`: Random 32+ character string
- `BETTER_AUTH_URL`: Your application URL (e.g., `http://localhost:3000`)
- Optional OAuth credentials (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

### Installation

```bash
pnpm install
```

### Database Setup

Generate and apply local D1 migrations:

```bash
# Generate schema migrations
pnpm db:generate

# Apply migrations locally
pnpm db:migrate:local
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Testing & Quality Assurance

```bash
# Linting
pnpm lint

# TypeScript verification
pnpm typecheck
```

Git hooks are automated via [Husky](https://typicode.github.io/husky/):
- **pre-commit:** runs `lint-staged` on staged files.
- **pre-push:** runs full TypeScript typechecking (`pnpm typecheck`).

## Deployment

The project is configured for Cloudflare Workers.

### Automated CI/CD (GitHub Actions)

A workflow is provided in `.github/workflows/deploy.yml`. To enable automated deployment on push to `main`:
Add the following repository secrets in GitHub:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

### Manual Deployment

```bash
# Preview build locally with OpenNext
pnpm preview

# Deploy migrations to remote Cloudflare D1
pnpm db:migrate:remote

# Build and deploy to Cloudflare Workers
pnpm deploy
```

## License

This project is licensed under the [MIT License](LICENSE).
