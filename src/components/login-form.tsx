"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { signIn } from "@/lib/auth-client"
import Image from "next/image"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const identifier = (formData.get("identifier") as string)?.trim() || ""
    const password = formData.get("password") as string

    try {
      const isEmail = identifier.includes("@")
      const { error: authError } = isEmail
        ? await signIn.email({
            email: identifier,
            password,
            callbackURL: "/profile",
          })
        : await signIn.username({
            username: identifier.replace(/^@/, ""),
            password,
            callbackURL: "/profile",
          })

      if (authError) {
        setError(authError.message || "Invalid credentials.")
        setIsLoading(false)
        return
      }

      router.push("/profile")
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    setError(null)
    setLoadingProvider(provider)

    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      })
    } catch {
      setError("Failed to initialize social sign-in. Please try again.")
      setLoadingProvider(null)
    }
  }

  const isPending = isLoading || loadingProvider !== null

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <Image
                src={"/favicon.ico"}
                alt="Zerochirou"
                width={50}
                height={50}
              />
              <span className="sr-only">Threads</span>
            </Link>
            <h1 className="text-xl font-bold">Zerochirou Gate</h1>
            <FieldDescription>
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </FieldDescription>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={() => handleSocialSignIn("github")}
            >
              <Image
                src={"/assets/icons/github.svg"}
                alt=""
                width={20}
                height={20}
              />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={() => handleSocialSignIn("google")}
            >
              <Image
                src={"/assets/icons/google.svg"}
                alt=""
                width={20}
                height={20}
              />
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Properti atau website ini merupakan sebuah cloning dari{" "}
        <a href="https://www.threads.com">Threads</a> dan bukan website komersial. Sebatas karya (cloning)
      </FieldDescription>
    </div>
  );
}
