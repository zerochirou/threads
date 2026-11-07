"use client"

import * as React from "react"
import Link from "next/link"
import type { ThreadLinkPreview } from "../types"
import { cn } from "@/lib/utils"

export interface ThreadPreviewCardProps {
  preview: ThreadLinkPreview
  className?: string
}

export function ThreadPreviewCard({ preview, className }: ThreadPreviewCardProps) {
  return (
    <Link
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "mt-2 block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#070b14] overflow-hidden shadow-sm group transition-transform active:scale-[0.99]",
        className
      )}
    >
      {/* Visual Graphic Area */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#0a0f1d] via-[#0d162d] to-[#162544] flex flex-col justify-between p-6 overflow-hidden">
        {/* Top Navbar Simulation */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white tracking-wide">Style UI</span>
            <span className="hidden sm:inline hover:text-white transition-colors">Libraries</span>
            <span className="hidden sm:inline hover:text-white transition-colors">Backgrounds</span>
            <span className="hidden sm:inline hover:text-white transition-colors">Design.md</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/90">
              GitHub
            </span>
            <span className="rounded-full bg-white text-black px-2.5 py-0.5 text-[10px] font-semibold">
              Submit
            </span>
          </div>
        </div>

        {/* Astronaut & Moon Background Illustration */}
        <div className="absolute inset-0 pointer-events-none  ">
          {/* Glowing Moon */}
          <div className="absolute -top-4 right-10 sm:right-20 size-48 sm:size-64 rounded-full bg-gradient-to-b from-white/95 via-neutral-200/80 to-transparent blur-[0.5px] opacity-85 shadow-[0_0_50px_rgba(255,255,255,0.15)]" />
          <div className="absolute top-10 right-28 sm:right-36 size-12 rounded-full bg-neutral-400/20 blur-xs" />
          <div className="absolute top-20 right-16 sm:right-24 size-16 rounded-full bg-neutral-400/15 blur-xs" />

          {/* Water reflection horizon */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#101b33] to-transparent border-t border-white/10" />

          {/* Astronaut Silhouette */}
          <svg
            className="absolute bottom-3 right-16 sm:right-28 h-20 w-12 text-white/90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            viewBox="0 0 24 40"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="7" r="5" fill="#f3f4f6" />
            <ellipse cx="13" cy="7" rx="3" ry="2.2" fill="#d97706" />
            <rect x="5" y="11" width="4" height="12" rx="1.5" fill="#9ca3af" />
            <path d="M8 12 C8 10 16 10 16 12 L16 23 C16 24 15 25 14 25 L10 25 C9 25 8 24 8 23 Z" fill="#e5e7eb" />
            <path d="M9 25 L8 35 L10 36 L11 25" fill="#d1d5db" />
            <path d="M13 25 L15 34 L17 35 L15 25" fill="#e5e7eb" />
            <ellipse cx="12" cy="38" rx="7" ry="1.5" fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>

        {/* Headline Typography */}
        <div className="relative z-10 max-w-[280px] sm:max-w-[340px] pt-4">
          <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {preview.headline ?? "AI will never understand your taste."}
            <br />
            <span className="text-white/90">{preview.subheadline ?? "Find yours here."}</span>
          </h3>
          <div className="pt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-white/10 group-hover:bg-white/20 backdrop-blur-xs rounded-full px-3 py-1 transition-colors">
              Explore Directory →
            </span>
          </div>
        </div>

        <div className="relative z-10 text-[9px] text-white/40 tracking-wide font-mono">
          {preview.tagline ?? "Curated UI libraries, background generators, and starter kits."}
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-neutral-950 dark:bg-black/80 flex flex-col gap-0.5 border-t border-neutral-800/80">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">{preview.domain}</span>
        </div>
        <h4 className="text-sm font-semibold text-foreground truncate group-hover:underline">
          {preview.title}
        </h4>
      </div>
    </Link>
  )
}
