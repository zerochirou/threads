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
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"
import { RiGalleryLine, RiGithubFill, RiGoogleFill } from "@remixicon/react"

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
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error: authError } = await signIn.email({
        email,
        password,
        callbackURL: "/",
      })

      if (authError) {
        setError(authError.message || "Invalid email or password.")
        setIsLoading(false)
        return
      }

      router.push("/")
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
              <div className="flex size-8 items-center justify-center rounded-md">
                <RiGalleryLine className="size-6" />
              </div>
              <span className="sr-only">Threads</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome back</h1>
            <FieldDescription>
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </FieldDescription>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isPending}
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isPending}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={() => handleSocialSignIn("github")}
            >
              <RiGithubFill className="size-4" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={() => handleSocialSignIn("google")}
            >
              <RiGoogleFill className="size-4" />
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
