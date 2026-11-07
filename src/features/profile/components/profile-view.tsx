"use client";

import * as React from "react";
import { ProfileHeaderNav } from "./profile-header-nav";
import { ProfileBio } from "./profile-bio";
import { ProfileTabsSection } from "./profile-tabs-section";
import { FollowersDialog } from "./followers-dialog";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProfileUser } from "../types";
import type { ThreadPostItem } from "@/features/content-scrollbar/types";
import { cn } from "@/lib/utils";

export interface ProfileViewProps {
  user?: ProfileUser;
  posts?: ThreadPostItem[];
  className?: string;
}

export function ProfileView({
  user: initialUser,
  posts,
  className,
}: ProfileViewProps) {
  const defaultUser: ProfileUser = {
    name: "Azzam",
    username: "zerochirou",
    bio: "A young Programmer.",
    link: {
      label: "zerochirou.com",
      url: "https://zerochirou.com",
      extraCount: 1,
    },
    communities: ["Anime Threads", "Design Threads", "Business Threads"],
    extraCommunitiesCount: 2,
    avatarUrl:
      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=threads-user",
    followersCount: 9,
    followerAvatars: [
      "https://api.dicebear.com/9.x/avataaars/svg?seed=follower-1",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=follower-2",
    ],
  };

  const [user, setUser] = React.useState<ProfileUser>(
    initialUser || defaultUser,
  );
  const [isFollowersOpen, setIsFollowersOpen] = React.useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);

  const handleProfileSave = (updated: Partial<ProfileUser>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <>
      <ScrollArea
        className={cn(
          "h-screen w-full max-w-167 mx-auto px-2 md:px-4 py-2 select-none",
          "no-scrollbar **:data-[slot=scroll-area-scrollbar]:hidden **:data-[slot=scroll-area-viewport]:no-scrollbar",
          className,
        )}
      >
        <div className="flex flex-col gap-3 pb-24">
          <ProfileHeaderNav username={user.username} />

          <div className="w-full py-3 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 text-card-foreground shadow-xs overflow-hidden">
            <ProfileBio
              user={user}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onFollowersClick={() => setIsFollowersOpen(true)}
            />

            <ProfileTabsSection
              userAvatarUrl={user.avatarUrl}
              userFallback="ZC"
              posts={posts}
            />
          </div>
        </div>
      </ScrollArea>

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        user={user}
        onSave={handleProfileSave}
      />

      <FollowersDialog
        open={isFollowersOpen}
        onOpenChange={setIsFollowersOpen}
        followersCount={user.followersCount}
        followingCount={user.followingCount ?? 34}
      />
    </>
  );
}
