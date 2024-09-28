# Next.js SaaS Starter - task for evatix

## Overview

This is my interview task for [Evatix](https://evatix.com/) where I'm working on server side pagination, sorting, and filtering of blog post table.

I also worked on role based authorization and permission management.

At last I've updated the activity logging system.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

<details>
React now has built in hooks like `useActionState` to handle inline form errors and pending states. React Server Actions can replace a lot of boilerplate code needed to call an API Route from the client-side. And finally, the React `use` hook combined with Next.js makes it incredibly easy to build a powerful `useUser()` hook.

We're able to fetch the user from our Postgres database in the root layout, but _not_ await the `Promise`. Instead, we forward the `Promise` to a React context provider, where we can "unwrap" it and awaited the streamed in data. This means we can have the best of both worlds: easy code to fetch data from our database (e.g. `getUser()`) and a React hook we can use in Client Components (e.g. `useUser()`).

</details>

## Features

-   Ignored stipe webhooks and pricing system of starter kit as it was not the goal of this task
-   Server side pagination, sorting, and tag filtering
-   Role based authorization and permission management
-   Activity logging system for any user events

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Database**: [Postgres](https://www.postgresql.org/)
-   **ORM**: [Drizzle](https://orm.drizzle.team/)
-   **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone
cd next-saas-starter
pnpm install or yarn install
```

## Running Locally

Use the included setup script to create your `.env` file: add your postgres database URL as POSTGRES_URL

Then, run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following users and team:

-   User: `admin@test.com`
-   Password: `admin123`
-   User: `editor@test.com`
-   Password: `editor123`
-   User: `author@test.com`
-   Password: `author123`
-   User: `owner@test.com`
-   Password: `owner123`
-   User: `member@test.com`
-   Password: `member123`
-   User: `user@test.com`
-   Password: `user123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.
