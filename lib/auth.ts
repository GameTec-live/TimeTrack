import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/lib/db/schema";
import { db } from ".";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    socialProviders: {
        microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID as string,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
            tenantId: "common",
            authority: "https://login.microsoftonline.com",
            prompt: "select_account",
            enabled: Boolean(process.env.MICROSOFT_CLIENT_ID),
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            enabled: Boolean(process.env.GITHUB_CLIENT_ID),
        },
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
});
