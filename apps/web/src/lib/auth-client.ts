import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          enum: ["admin", "farmer", "customer"],
          default: "customer",
        },
      },
    }),
  ],
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});
