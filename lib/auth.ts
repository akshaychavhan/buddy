import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Lazy fallback to empty strings — pnpm build passes without creds.
    // Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET surfaces only at runtime
    // when a user clicks "Sign in with Google" (Google rejects invalid_client).
    // Same architectural pattern as @/lib/email's lazy Resend init (Day_32).
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink({ email, url });
      },
    }),
  ],
});
