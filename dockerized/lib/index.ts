import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint/style/noNonNullAssertion: This is a env var, its fine
export const db = drizzle(process.env.DATABASE_URL!);
