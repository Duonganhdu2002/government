This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

The project is organized into the following key directories:

- **`/app`** - Next.js App Router pages and layouts
- **`/components`** - Reusable UI components
- **`/lib`** - Core functionality and API clients
- **`/store`** - Redux state management
- **`/types`** - TypeScript type definitions
- **`/utils`** - Utility functions and helpers

### Recent Changes

The codebase has been refactored to eliminate functional overlap and improve maintainability:

1. **Types Consolidation** - All type definitions are now in `/src/types`, with previous auth types moved from `/src/lib/types` to `/src/types/auth.ts`.

2. **Auth Utilities** - Authentication utilities are consolidated in `/src/utils/auth.ts`, removing duplication between `api.ts` and `authHeaders.ts`.

3. **Logout Handling** - Standardized logout process across the application with `useLogoutHandler` hook that directly uses the store.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
