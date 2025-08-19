// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url:process.env.DATABASE_URL!,
    authToken:process.env.DATABASE_AUTH_TOKEN!
  },
  out:'./src/drizzle',
  schema:'./src/drizzle/schema.ts'
});
