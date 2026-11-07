"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  RiArrowLeftSLine,
  RiBookmarkLine,
  RiComputerLine,
  RiHeartLine,
  RiInstagramLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useSession } from "@/lib/auth-client";
import { useSessionActions } from "@/features/commons/services/session-service";
import { cn } from "@/lib/utils";

export interface ProfileHeaderNavProps {
  username?: string;
  isSelf?: boolean;
  className?: string;
}

export function ProfileHeaderNav({
  username = "zerochirou",
  isSelf = false,
  className,
}: ProfileHeaderNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: sessionData } = useSession();
  const { performSignOut } = useSessionActions();

  const handleSignOut = async () => {
    await performSignOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 py-2",
        className
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {!isSelf && (
          <button
            type="button"
            onClick={() => router.back()}
            className="md:hidden inline-flex items-center gap-0.5 -ml-1.5 px-1.5 py-1 rounded-lg text-sm font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <RiArrowLeftSLine className="size-5" />
            <span>Back</span>
          </button>
        )}
        <span
          className={cn(
            "text-base sm:text-lg font-semibold text-neutral-900 dark:text-white truncate",
            !isSelf && "hidden md:inline"
          )}
        >
          {username}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex items-center justify-center size-9 rounded-full text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
        >
          <RiInstagramLine className="size-5" />
        </a>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full cursor-pointer"
                      aria-label="Profile options"
                    >
                      <Image
                        src="/assets/icons/more.svg"
                        alt="Profile options"
                        width={20}
                        height={20}
                        className="size-5 object-contain dark:invert"
                      />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="bottom">More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl p-1.5 shadow-xl bg-accent"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
              >
                Copy profile link
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/saved"
                    className="flex items-center gap-2 rounded-lg cursor-pointer"
                  />
                }
              >
                <RiBookmarkLine className="size-4" />
                <span>Saved</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/liked"
                    className="flex items-center gap-2 rounded-lg cursor-pointer"
                  />
                }
              >
                <RiHeartLine className="size-4" />
                <span>Liked</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                Appearance
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme ?? "system"}
                onValueChange={(val) => setTheme(val)}
              >
                <DropdownMenuRadioItem
                  value="dark"
                  className="rounded-lg cursor-pointer"
                >
                  <RiMoonLine data-icon="inline-start" className="size-4" />
                  <span>Dark</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="light"
                  className="rounded-lg cursor-pointer"
                >
                  <RiSunLine data-icon="inline-start" className="size-4" />
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="system"
                  className="rounded-lg cursor-pointer"
                >
                  <RiComputerLine data-icon="inline-start" className="size-4" />
                  <span>Auto</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              {sessionData?.user ? (
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <RiLogoutBoxLine className="size-4" />
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
                      className="flex items-center gap-2 rounded-lg cursor-pointer"
                    />
                  }
                >
                  <RiLoginBoxLine className="size-4" />
                  <span>Log in</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
