"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface HomeFooterProps {
  className?: string
}

export function HomeFooter({ className }: HomeFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-1.5 text-center text-xs text-muted-foreground/80 py-6 select-none",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>&copy; {currentYear}</span>
        <Link href="/terms" className="hover:underline transition-colors">
          Threads Terms
        </Link>
        <Link href="/privacy" className="hover:underline transition-colors">
          Privacy Policy
        </Link>
      </div>
      <div>
        <Link href="/cookies" className="hover:underline transition-colors">
          Cookies Policy
        </Link>
      </div>
    </footer>
  )
}
