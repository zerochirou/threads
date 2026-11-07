"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiBookmarkLine,
  RiComputerLine,
  RiEqualLine,
  RiHeartLine,
  RiMoonLine,
  RiSettings3Line,
  RiSunLine,
  RiThreadsFill,
} from "@remixicon/react";
import { PostComposerDialog } from "@/features/composer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showMore, setShowMore] = React.useState(false);
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);

  const primaryNavItems = [
    { label: "For you", href: "/", iconSrc: "/assets/icons/home.svg" },
    { label: "Search", href: "/search", iconSrc: "/assets/icons/search.svg" },
    // {
    //   label: "Messages",
    //   href: "/messages",
    //   iconSrc: "/assets/icons/messages.svg",
    // },
    {
      label: "Profile",
      href: "/profile",
      iconSrc: "/assets/icons/profile.svg",
    },
  ];

  // const communities = [
  //   {
  //     label: "Anime Threads",
  //     href: "/communities/anime",
  //     icon: <span className="text-base select-none leading-none">🐺</span>,
  //   },
  //   {
  //     label: "Design Threads",
  //     href: "/communities/design",
  //     icon: <span className="text-base select-none leading-none">✏️</span>,
  //   },
  //   {
  //     label: "Business Threads",
  //     href: "/communities/business",
  //     icon: <span className="text-base select-none leading-none">💼</span>,
  //   },
  //   {
  //     label: "Teacher Threads",
  //     href: "/communities/teacher",
  //     icon: <span className="text-base select-none leading-none">☕</span>,
  //   },
  //   {
  //     label: "Tech Threads",
  //     href: "/communities/tech",
  //     icon: (
  //       <span className="size-5 rounded-[4px] bg-neutral-100 dark:bg-[#161d2a] border border-neutral-200 dark:border-emerald-500/30 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 select-none shadow-xs">
  //         &gt;_
  //       </span>
  //     ),
  //   },
  // ];

  return (
    <aside
      className={cn(
        "w-60 shrink-0 min-h-screen bg-white dark:bg-[#101010] text-neutral-900 dark:text-[#e7e9eb] border-r border-neutral-200/60 dark:border-neutral-900/40 flex flex-col justify-between px-3.5 pt-5 pb-8 select-none font-sans transition-colors duration-200",
        className,
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between pl-0.5 pr-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-neutral-950 dark:text-white hover:opacity-90 transition-opacity"
            aria-label="Threads Home"
          >
            <RiThreadsFill className="size-7" />
            <span className="font-bold italic text-[22px] tracking-tight lowercase">
              threads
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md cursor-pointer transition-colors"
                          aria-label="Menu"
                        >
                          <RiEqualLine className="size-6" />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="bottom">More options</TooltipContent>
              </Tooltip>

              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-56 p-1.5 dark:bg-[#262626] shadow-2xl backdrop-blur-md"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Appearance
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme ?? "system"}
                    onValueChange={(val) => setTheme(val)}
                  >
                    <DropdownMenuRadioItem
                      value="dark"
                      className="rounded-xl px-2.5 py-2 cursor-pointer"
                    >
                      <RiMoonLine data-icon="inline-start" className="size-4" />
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="light"
                      className="rounded-xl px-2.5 py-2 cursor-pointer"
                    >
                      <RiSunLine data-icon="inline-start" className="size-4" />
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="system"
                      className="rounded-xl px-2.5 py-2 cursor-pointer"
                    >
                      <RiComputerLine
                        data-icon="inline-start"
                        className="size-4"
                      />
                      <span>Auto</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={
                      <Link
                        href="/settings"
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium cursor-pointer"
                      />
                    }
                  >
                    <RiSettings3Line
                      data-icon="inline-start"
                      className="size-4"
                    />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={
                      <Link
                        href="/insights"
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium cursor-pointer"
                      />
                    }
                  >
                    <RiBarChartBoxLine
                      data-icon="inline-start"
                      className="size-4"
                    />
                    <span>Insights</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="mt-8 flex flex-col pl-0.5" aria-label="Main navigation">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 gap-2 text-[15px] transition-colors duration-150 py-1.5 rounded-sm",
                  isActive
                    ? "text-neutral-950 dark:text-white dark:bg-accent"
                    : "text-neutral-700 hover:text-neutral-950 hover:dark:bg-accent dark:text-[#e7e9eb] dark:hover:text-white",
                )}
              >
                <div className="relative flex items-center justify-center size-[18px] shrink-0">
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={22}
                    height={22}
                    className={cn(
                      "size-[18px] object-contain group-hover:scale-105 transition-transform",
                      item.iconSrc === "/assets/icons/notifications.svg"
                        ? "dark:[filter:invert(1)_hue-rotate(180deg)]"
                        : "dark:invert",
                    )}
                  />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* <div className="mt-7 pl-0.5">
          <h2 className="text-xs font-semibold text-[#757575] tracking-tight">
            Communities
          </h2>
          <div className="mt-3 flex flex-col gap-3.5">
            {communities.map((community) => (
              <Link
                key={community.label}
                href={community.href}
                className="group flex items-center gap-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-950 dark:text-[#e7e9eb] dark:hover:text-white transition-colors duration-150 py-0.5"
              >
                <div className="flex items-center justify-center size-5 shrink-0 group-hover:scale-105 transition-transform">
                  {community.icon}
                </div>
                <span>{community.label}</span>
              </Link>
            ))}
          </div>
        </div> */}

        <div className="mt-7 pl-0.5">
          <div className="flex items-center justify-between pr-1">
            <h2 className="text-xs font-semibold text-[#757575] tracking-tight">
              Other feeds
            </h2>
            <Button
              variant="ghost"
              size="xs"
              className="h-auto p-0 text-xs font-normal text-[#757575] hover:text-neutral-900 dark:hover:text-white hover:bg-transparent cursor-pointer"
            >
              Edit
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3.5">
            <Link
              href="/?feed=following"
              className="flex items-center text-[15px] font-semibold text-neutral-700 hover:text-neutral-950 dark:text-[#e7e9eb] dark:hover:text-white transition-colors duration-150 py-0.5"
            >
              <span>Following</span>
            </Link>

            <Link
              href="/saved"
              className="group flex items-center gap-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-950 dark:text-[#e7e9eb] dark:hover:text-white transition-colors duration-150 py-0.5"
            >
              <div className="flex items-center justify-center size-[18px] shrink-0">
                <RiBookmarkLine className="size-[18px] text-neutral-800 dark:text-white shrink-0 group-hover:scale-105 transition-transform" />
              </div>
              <span>Saved</span>
            </Link>

            <Link
              href="/liked"
              className="group flex items-center gap-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-950 dark:text-[#e7e9eb] dark:hover:text-white transition-colors duration-150 py-0.5"
            >
              <div className="flex items-center justify-center size-[18px] shrink-0">
                <RiHeartLine className="size-[18px] text-neutral-800 dark:text-white shrink-0 group-hover:scale-105 transition-transform" />
              </div>
              <span>Liked</span>
            </Link>

            <div className="pl-[34px]">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowMore(!showMore)}
                className="h-auto p-0 text-sm font-normal text-[#757575] hover:text-neutral-900 dark:hover:text-white hover:bg-transparent cursor-pointer"
              >
                {showMore ? "Show less" : "Show more"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={() => setIsComposeOpen(true)}
          className="w-full h-11 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
        >
          <RiAddLine
            data-icon="inline-start"
            className="size-5 stroke-[0.5]"
          />
          <span>New thread</span>
        </Button>

        <PostComposerDialog
          open={isComposeOpen}
          onOpenChange={setIsComposeOpen}
        />
      </div>
    </aside>
  );
}
