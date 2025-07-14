import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { shopRouter } from "./shop";
import { adminRouter } from "./admin";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  shop: shopRouter,
  admin: adminRouter,
};
export type AppRouter = typeof appRouter;
