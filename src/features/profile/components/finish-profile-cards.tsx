"use client"

import * as React from "react"
import { RiEditLine, RiCheckLine, RiArrowRightLine, RiEditBoxLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import type { SetupCardItem } from "../types"
import { cn } from "@/lib/utils"

export interface FinishProfileCardsProps {
  cards?: SetupCardItem[]
  remainingCount?: number
  className?: string
}

export function FinishProfileCards({
  cards: initialCards,
  remainingCount = 1,
  className,
}: FinishProfileCardsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const defaultCards: SetupCardItem[] = [
    {
      id: "card-1",
      title: "Create thread",
      description: "Say what's on your mind or share a recent highlight.",
      actionLabel: "Create",
      isDone: false,
    },
  ]

  const [cards, setCards] = React.useState<SetupCardItem[]>(
    initialCards || defaultCards
  )

  const handleAction = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isDone: !c.isDone } : c))
    )
  }

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 240, behavior: "smooth" })
  }

  return (
    <div className={cn("px-6 py-4 flex flex-col gap-3 relative", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-neutral-900 dark:text-white tracking-tight">
          Finish your profile
        </h2>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {remainingCount} left
        </span>
      </div>

      {/* Cards Scrollable Row with floating right arrow button */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {cards.map((card) => {
            return (
              <div
                key={card.id}
                className="w-56 shrink-0 rounded-xl bg-neutral-50 dark:bg-accent/50 border border-neutral-200/80 dark:border-neutral-800/80 p-4 flex flex-col items-center text-center justify-between min-h-[220px] transition-colors"
              >
                {/* Center Icon badge */}
                <div className="size-12 rounded-full bg-neutral-200/80 dark:bg-background flex items-center justify-center text-neutral-900 dark:text-white mt-1">
                  {card.isDone ? (
                    <RiEditLine className="size-5" />
                  ) : (
                    <RiEditBoxLine />
                  )}
                </div>

                {/* Card Title & Desc */}
                <div className="flex flex-col gap-1 my-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Action Button */}
                {card.isDone ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full rounded-sm h-8 text-xs font-semibold border-neutral-300 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 bg-transparent disabled:opacity-60"
                  >
                    Done
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAction(card.id)}
                    className="w-full rounded-sm h-8 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 cursor-pointer shadow-xs"
                  >
                    {card.actionLabel}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Right Arrow */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 size-9 rounded-full bg-neutral-900/90 dark:bg-neutral-800/90 text-white shadow-xl border border-neutral-700/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Scroll right"
        >
          <RiArrowRightLine className="size-4" />
        </button>
      </div>
    </div>
  )
}
