"use client";

import { useState } from "react";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export function SocialAuthButtons({ callbackURL = "/" }: { callbackURL?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  async function handleSocialSignIn(provider: "google" | "github") {
    try {
      setLoadingProvider(provider);
      await signIn.social({
        provider,
        callbackURL,
      });
    } catch {
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialSignIn("google")}
      >
        <RiGoogleFill className="size-4" />
        <span>Continue with Google</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialSignIn("github")}
      >
        <RiGithubFill className="size-4" />
        <span>Continue with GitHub</span>
      </Button>
    </div>
  );
}
