import { drizzle } from 'drizzle-orm/libsql';
import * as dotenv from 'dotenv';
dotenv.config();
const db = drizzle({ connection: {
  url: process.env.DATABASE_URL!, 
  authToken: process.env.DATABASE_AUTH_TOKEN! 
}});


export default db
