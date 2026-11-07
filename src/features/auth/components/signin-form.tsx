"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { isEmailIdentifier, useAuthCacheSync } from "../services/auth-service";
import { SocialAuthButtons } from "./social-auth-buttons";

export function SignInForm() {
  const router = useRouter();
  const { clearAndRevalidateAuthCaches } = useAuthCacheSync();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedIdentifier = identifier.trim();

    try {
      const isEmail = isEmailIdentifier(trimmedIdentifier);
      const { error: signInError } = isEmail
        ? await signIn.email({
            email: trimmedIdentifier,
            password,
            callbackURL: "/profile",
          })
        : await signIn.username({
            username: trimmedIdentifier.replace(/^@/, ""),
            password,
            callbackURL: "/profile",
          });

      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      await clearAndRevalidateAuthCaches();
      router.push("/profile");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials or continue with a social provider
        </p>
      </div>

      <SocialAuthButtons callbackURL="/profile" />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="bg-background px-2 text-xs uppercase text-muted-foreground absolute">
          Or continue with
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="identifier">
            Email or Username
          </label>
          <input
            id="identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="username or you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
