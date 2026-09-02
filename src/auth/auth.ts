import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";

import client, { database } from "../config/database.js";
import { emailService } from "../services/email.service.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,

  basePath: "/api/v1/auth",

  trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL],

  database: mongodbAdapter(database, {
    client,
  }),

  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      void emailService.sendPasswordResetEmail(user.email, url);
    },

    revokeSessionsOnPasswordReset: true,

    resetPasswordTokenExpiresIn: 3600,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  plugins: [admin()],
});
