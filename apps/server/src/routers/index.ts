import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { shopRouter } from "./shop";

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
};
export type AppRouter = typeof appRouter;
