import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    usernameClient({ displayUsername: false }),
    inferAdditionalFields<Auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  isUsernameAvailable,
} = authClient;

