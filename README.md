# TimeTrack

Opensource timekeeping and time tracking.

Did you ever want to know how much time you wasted on a project? no? Well now you can!

Support for multiple projects and unique time tracking per project.

## Setup

There are multiple ways to run TimeTrack

- Download and run the docker compose (`docker compose up -d`)

- Deploy on vercel (Clone the repo, change the adapter in drizzle.config.ts to whatever database provider you prefer and deploy)

- Development / bare metal (`bun install` followed by `bun run dev` or `bun run start`)

Nomatter how you run it, you will have to decide a few things and set some environment variables.

A Postgresql Database is required.

Once a database is configured, set it up using the `DATABASE_URL` environment variable.

Generate a random string for the `BETTER_AUTH_SECRET` variable and set `BETTER_AUTH_URL` to your applications base url.

Then, depending on your choice of identity provider, either set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` or `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to their respective values.

For more details, see the better-auth docs [here](https://www.better-auth.com/docs).