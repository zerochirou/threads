"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  RiAddLine,
  RiBookmarkLine,
  RiComputerLine,
  RiEditBoxLine,
  RiEqualLine,
  RiHeartFill,
  RiHeartLine,
  RiHome5Fill,
  RiHome5Line,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSearch2Fill,
  RiSearchLine,
  RiSunLine,
  RiThreadsFill,
  RiUser3Fill,
  RiUser3Line,
} from "@remixicon/react";
import { PostComposerDialog } from "@/features/composer";
import { useSession } from "@/lib/auth-client";
import {
  isMobileNavRouteActive,
  resolveMobileBottomNavItems,
  useSessionActions,
} from "../services/session-service";
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
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: sessionData } = useSession();
  const { performSignOut } = useSessionActions();
  const [showMore, setShowMore] = React.useState(false);
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);

  const handleSignOut = async () => {
    await performSignOut();
    router.push("/signin");
    router.refresh();
  };

  const primaryNavItems = [
    { label: "For you", href: "/", iconSrc: "/assets/icons/home.svg" },
    { label: "Search", href: "/search", iconSrc: "/assets/icons/search.svg" },
    {
      label: "Profile",
      href: "/profile",
      iconSrc: "/assets/icons/profile.svg",
    },
  ];

  const mobileBottomItems = resolveMobileBottomNavItems();

  const renderMobileIcon = (id: string, isActive: boolean) => {
    switch (id) {
      case "home":
        return isActive ? (
          <RiHome5Fill className="size-6" />
        ) : (
          <RiHome5Line className="size-6" />
        );
      case "search":
        return isActive ? (
          <RiSearch2Fill className="size-6" />
        ) : (
          <RiSearchLine className="size-6" />
        );
      case "compose":
        return <RiEditBoxLine className="size-6" />;
      case "liked":
        return isActive ? (
          <RiHeartFill className="size-6" />
        ) : (
          <RiHeartLine className="size-6" />
        );
      case "profile":
      default:
        return isActive ? (
          <RiUser3Fill className="size-6" />
        ) : (
          <RiUser3Line className="size-6" />
        );
    }
  };

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex md:w-20 lg:w-60 shrink-0 min-h-screen bg-white dark:bg-[#101010] text-neutral-900 dark:text-[#e7e9eb] border-r border-neutral-200/60 dark:border-neutral-900/40 flex-col justify-between px-2.5 lg:px-3.5 pt-5 pb-8 select-none font-sans transition-colors duration-200",
          className
        )}
      >
        <div className="flex flex-col items-center lg:items-stretch">
          <div className="flex items-center justify-between pl-0.5 pr-1 w-full">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-neutral-950 dark:text-white hover:opacity-90 transition-opacity mx-auto lg:mx-0"
              aria-label="Threads Home"
            >
              <RiThreadsFill className="size-7 shrink-0" />
              <span className="hidden lg:inline font-bold italic text-[22px] tracking-tight lowercase">
                threads
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
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
                          href="/saved"
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium cursor-pointer"
                        />
                      }
                    >
                      <RiBookmarkLine
                        data-icon="inline-start"
                        className="size-4"
                      />
                      <span>Saved</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      render={
                        <Link
                          href="/liked"
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium cursor-pointer"
                        />
                      }
                    >
                      <RiHeartLine
                        data-icon="inline-start"
                        className="size-4"
                      />
                      <span>Liked</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuGroup>
                    {sessionData?.user ? (
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-red-500 focus:text-red-500 cursor-pointer"
                      >
                        <RiLogoutBoxLine
                          data-icon="inline-start"
                          className="size-4"
                        />
                        <span>
                          Log out (@
                          {sessionData.user.username || sessionData.user.name})
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        render={
                          <Link
                            href="/signin"
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium cursor-pointer"
                          />
                        }
                      >
                        <RiLoginBoxLine
                          data-icon="inline-start"
                          className="size-4"
                        />
                        <span>Log in</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav
            className="mt-8 flex flex-col gap-1 lg:pl-0.5 w-full items-center lg:items-stretch"
            aria-label="Main navigation"
          >
            {primaryNavItems.map((item) => {
              const isActive = isMobileNavRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "group flex items-center justify-center lg:justify-start px-2.5 lg:px-2 gap-2 text-[15px] transition-colors duration-150 py-2.5 lg:py-1.5 rounded-xl lg:rounded-sm min-h-11 lg:min-h-0",
                    isActive
                      ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-accent"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/70 hover:dark:bg-accent dark:text-[#e7e9eb] dark:hover:text-white"
                  )}
                >
                  <div className="relative flex items-center justify-center size-5 lg:size-[18px] shrink-0">
                    <Image
                      src={item.iconSrc}
                      alt={item.label}
                      width={22}
                      height={22}
                      className={cn(
                        "size-5 lg:size-[18px] object-contain group-hover:scale-105 transition-transform",
                        "dark:invert"
                      )}
                    />
                  </div>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 lg:pl-0.5 w-full">
            <div className="hidden lg:flex items-center justify-between pr-1">
              <h2 className="text-xs font-semibold text-[#757575] tracking-tight">
                Other feeds
              </h2>
            </div>

            <div className="mt-2 lg:mt-3 flex flex-col gap-1 items-center lg:items-stretch">
              <Link
                href="/?feed=following"
                className="hidden lg:flex items-center px-2 text-[15px] font-semibold text-neutral-700 hover:text-neutral-950 dark:text-[#e7e9eb] dark:hover:text-white transition-colors duration-150 py-1"
              >
                <span>Following</span>
              </Link>

              <Link
                href="/saved"
                aria-label="Saved"
                className={cn(
                  "group flex items-center justify-center lg:justify-start px-2.5 lg:px-2 gap-2 text-[15px] transition-colors duration-150 py-2.5 lg:py-1.5 rounded-xl lg:rounded-sm min-h-11 lg:min-h-0",
                  pathname === "/saved"
                    ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-accent"
                    : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/70 hover:dark:bg-accent dark:text-[#e7e9eb] dark:hover:text-white"
                )}
              >
                <div className="flex items-center justify-center size-5 lg:size-[18px] shrink-0">
                  <RiBookmarkLine className="size-5 lg:size-[18px] text-neutral-800 dark:text-white shrink-0 group-hover:scale-105 transition-transform" />
                </div>
                <span className="hidden lg:inline">Saved</span>
              </Link>

              <Link
                href="/liked"
                aria-label="Liked"
                className={cn(
                  "group flex items-center justify-center lg:justify-start px-2.5 lg:px-2 gap-2 text-[15px] transition-colors duration-150 py-2.5 lg:py-1.5 rounded-xl lg:rounded-sm min-h-11 lg:min-h-0",
                  pathname === "/liked"
                    ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-accent"
                    : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/70 hover:dark:bg-accent dark:text-[#e7e9eb] dark:hover:text-white"
                )}
              >
                <div className="flex items-center justify-center size-5 lg:size-[18px] shrink-0">
                  <RiHeartLine className="size-5 lg:size-[18px] text-neutral-800 dark:text-white shrink-0 group-hover:scale-105 transition-transform" />
                </div>
                <span className="hidden lg:inline">Liked</span>
              </Link>

              <div className="hidden lg:block pl-[34px]">
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

        <div className="pt-6 flex flex-col items-center lg:items-stretch gap-3">
          <Button
            onClick={() => setIsComposeOpen(true)}
            aria-label="New thread"
            className="size-11 lg:w-full lg:h-11 rounded-2xl lg:rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
          >
            <RiAddLine
              data-icon="inline-start"
              className="size-5 stroke-[0.5] shrink-0"
            />
            <span className="hidden lg:inline">New thread</span>
          </Button>
        </div>
      </aside>

      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-around px-2 select-none"
      >
        {mobileBottomItems.map((item) => {
          const isActive = isMobileNavRouteActive(pathname, item.href);

          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIsComposeOpen(true)}
                aria-label={item.label}
                className="flex items-center justify-center min-w-12 min-h-11 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-foreground active:scale-95 transition-all cursor-pointer"
              >
                {renderMobileIcon(item.id, false)}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href ?? "/"}
              aria-label={item.label}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-12 min-h-11 rounded-xl transition-all active:scale-95 cursor-pointer",
                isActive
                  ? "text-neutral-950 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
              )}
            >
              {renderMobileIcon(item.id, isActive)}
              {item.id === "liked" && (
                <span
                  aria-hidden="true"
                  className="mt-0.5 size-1 rounded-full bg-rose-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <PostComposerDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
      />
    </>
  );
}
