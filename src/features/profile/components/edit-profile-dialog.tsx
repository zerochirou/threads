"use client"

import * as React from "react"
import { RiArrowRightSLine } from "@remixicon/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateUser } from "@/lib/auth-client"
import { useSWRConfig } from "swr"
import { isThreadsCacheKey } from "@/features/content-scrollbar/services/threads-service"
import { isUserFollowCacheKey } from "@/features/home/services/suggestions-service"
import type { ProfileUser } from "../types"

export interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ProfileUser
  onSave?: (updated: Partial<ProfileUser>) => void
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileDialogProps) {
  const [name, setName] = React.useState(user.name)
  const [username, setUsername] = React.useState(user.username)
  const [bio, setBio] = React.useState(user.bio || "")
  const [interests, setInterests] = React.useState(
    user.interests || user.communities?.join(", ") || ""
  )
  const [podcastUrl, setPodcastUrl] = React.useState(user.podcastUrl || "")
  const [showInstagramBadge, setShowInstagramBadge] = React.useState(
    user.showInstagramBadge ?? false
  )
  const [showRecentViews, setShowRecentViews] = React.useState(
    user.showRecentViews ?? false
  )
  const [isPrivate, setIsPrivate] = React.useState(user.isPrivate ?? false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [prevOpen, setPrevOpen] = React.useState(open)
  const { mutate } = useSWRConfig()

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setName(user.name)
      setUsername(user.username)
      setBio(user.bio || "")
      setInterests(user.interests || user.communities?.join(", ") || "")
      setPodcastUrl(user.podcastUrl || "")
      setShowInstagramBadge(user.showInstagramBadge ?? false)
      setShowRecentViews(user.showRecentViews ?? false)
      setIsPrivate(user.isPrivate ?? false)
      setError(null)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(nextOpen)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim() || user.name
    const trimmedUsername = username
      .trim()
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9_.]/g, "")
    const trimmedBio = bio.trim()
    const trimmedInterests = interests.trim()
    const trimmedPodcastUrl = podcastUrl.trim()

    if (trimmedUsername && trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters.")
      return
    }

    const updatedFields: Partial<ProfileUser> = {
      name: trimmedName,
      username: trimmedUsername || user.username,
      bio: trimmedBio,
      interests: trimmedInterests,
      podcastUrl: trimmedPodcastUrl,
      showInstagramBadge,
      showRecentViews,
      isPrivate,
      communities: trimmedInterests
        ? trimmedInterests.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    }

    if (!user.id) {
      onSave?.(updatedFields)
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    try {
      const { error: updateError } = await updateUser({
        name: trimmedName,
        username: trimmedUsername || user.username,
        bio: trimmedBio,
        interests: trimmedInterests,
        podcastUrl: trimmedPodcastUrl,
        showInstagramBadge,
        showRecentViews,
        isPrivate,
      })

      if (updateError) {
        setError(updateError.message || "Could not update profile.")
        setIsSaving(false)
        return
      }

      await mutate(
        (key) => isThreadsCacheKey(key) || isUserFollowCacheKey(key)
      )
      onSave?.(updatedFields)
      setIsSaving(false)
      onOpenChange(false)
    } catch {
      setError("An unexpected error occurred while saving your profile.")
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-[580px] rounded-2xl bg-[#181818] text-white border border-neutral-800 p-0 shadow-2xl overflow-hidden gap-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your Threads profile details, bio, and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <FieldGroup className="p-4 sm:p-6 gap-0 divide-y divide-neutral-800/80 max-h-[75dvh] overflow-y-auto no-scrollbar">
            <Field
              orientation="horizontal"
              className="pb-4 items-start justify-between gap-4"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="profile-name"
                  className="text-[13px] font-semibold text-white tracking-tight"
                >
                  Name
                </FieldLabel>
                <Input
                  id="profile-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isSaving}
                  className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-sm text-neutral-200 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
                />
              </FieldContent>

              <Avatar className="size-14 rounded-full border border-neutral-700/60 bg-neutral-800 shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-neutral-800 text-sm font-semibold text-neutral-300">
                  {(name || user.name).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Field>

            <Field className="py-4 gap-1">
              <FieldLabel
                htmlFor="profile-username"
                className="text-[13px] font-semibold text-white tracking-tight"
              >
                Username
              </FieldLabel>
              <Input
                id="profile-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={isSaving}
                className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-sm text-neutral-200 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
              />
            </Field>

            <Field className="py-4 gap-1">
              <FieldLabel
                htmlFor="profile-bio"
                className="text-[13px] font-semibold text-white tracking-tight"
              >
                Bio
              </FieldLabel>
              <Input
                id="profile-bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="+ Write bio"
                disabled={isSaving}
                className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-sm text-neutral-200 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
              />
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-3 cursor-pointer group"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="profile-interests"
                  className="text-[13px] font-semibold text-white tracking-tight cursor-pointer"
                >
                  Interests
                </FieldLabel>
                <Input
                  id="profile-interests"
                  name="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Add interests (comma separated)"
                  disabled={isSaving}
                  className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-xs text-neutral-400 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
                />
              </FieldContent>
              <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-3 cursor-pointer group"
            >
              <FieldTitle className="text-[13px] font-semibold text-white tracking-tight">
                Links
              </FieldTitle>
              <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors w-auto">
                <span>{user.link ? (user.link.extraCount ?? 0) + 1 : 0}</span>
                <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </div>
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-3 cursor-pointer group"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="profile-podcast"
                  className="text-[13px] font-semibold text-white tracking-tight cursor-pointer"
                >
                  Podcast
                </FieldLabel>
                <Input
                  id="profile-podcast"
                  name="podcastUrl"
                  value={podcastUrl}
                  onChange={(e) => setPodcastUrl(e.target.value)}
                  placeholder="+ Link to your podcast"
                  disabled={isSaving}
                  className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-xs text-neutral-400 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
                />
              </FieldContent>
              <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-4"
            >
              <FieldLabel
                htmlFor="show-ig-badge"
                className="text-[13px] font-semibold text-white tracking-tight cursor-pointer"
              >
                Show Instagram badge
              </FieldLabel>
              <Switch
                id="show-ig-badge"
                checked={showInstagramBadge}
                onCheckedChange={setShowInstagramBadge}
                disabled={isSaving}
                className="data-checked:bg-white data-unchecked:bg-neutral-700 shrink-0 w-auto"
              />
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-start justify-between gap-4"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="show-recent-views"
                  className="text-[13px] font-semibold text-white tracking-tight cursor-pointer"
                >
                  Show recent views
                </FieldLabel>
                <FieldDescription className="text-xs text-neutral-500 leading-relaxed">
                  This will be public on your profile when you get 1K+ recent views.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="show-recent-views"
                checked={showRecentViews}
                onCheckedChange={setShowRecentViews}
                disabled={isSaving}
                className="data-checked:bg-white data-unchecked:bg-neutral-700 shrink-0 mt-0.5 w-auto"
              />
            </Field>

            <Field
              orientation="horizontal"
              className="py-4 items-start justify-between gap-4"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="profile-privacy"
                  className="text-[13px] font-semibold text-white tracking-tight cursor-pointer"
                >
                  Private profile
                </FieldLabel>
                <FieldDescription className="text-xs text-neutral-500 leading-relaxed pr-4">
                  If you switch to private, only followers can see your threads. Your replies will be visible to followers and individual profiles you reply to.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="profile-privacy"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={isSaving}
                className="data-checked:bg-white data-unchecked:bg-neutral-700 shrink-0 mt-0.5 w-auto"
              />
            </Field>
          </FieldGroup>

          <div className="p-4 sm:p-6 pt-2 border-white/5">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-sm cursor-pointer transition-colors active:scale-[0.99] shadow-sm"
            >
              {isSaving ? "Saving..." : "Done"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

