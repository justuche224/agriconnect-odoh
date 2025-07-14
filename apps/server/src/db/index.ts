import { drizzle } from "drizzle-orm/node-postgres";
import * as auth from "./schema/auth";
import * as shop from "./schema/shop";

const schema = {
  ...auth,
  ...shop,
};

export const db = drizzle(process.env.DATABASE_URL || "", { schema });

export * from "./schema/auth";
export * from "./schema/shop";
