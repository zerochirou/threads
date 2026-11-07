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
    user.communities?.join(", ") ||
      "AnimeThreads, DesignThreads, BusinessThreads, Teacher Threads, Tech Threads"
  )
  const [showInstagramBadge, setShowInstagramBadge] = React.useState(false)
  const [showRecentViews, setShowRecentViews] = React.useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(user.name)
      setUsername(user.username)
      setBio(user.bio || "")
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave?.({
      name: name.trim() || user.name,
      username: username.trim() || user.username,
      bio: bio.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-[580px] rounded-2xl bg-[#181818] text-white border border-neutral-800 p-0 shadow-2xl overflow-hidden gap-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your Threads profile details, bio, and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Form Fields Container */}
          <FieldGroup className="p-6 gap-0 divide-y divide-neutral-800/80 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* Field 1: Name & Avatar */}
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

            {/* Field 2: Username */}
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
                placeholder="Username"
                className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-sm text-neutral-200 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
              />
            </Field>

            {/* Field 3: Bio */}
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
                className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-sm text-neutral-200 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
              />
            </Field>

            {/* Field 4: Interests */}
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
                  placeholder="Add interests"
                  className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-0.5 text-xs text-neutral-400 placeholder:text-neutral-500 shadow-none focus-visible:ring-0"
                />
              </FieldContent>
              <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
            </Field>

            {/* Field 5: Links */}
            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-3 cursor-pointer group"
            >
              <FieldTitle className="text-[13px] font-semibold text-white tracking-tight">
                Links
              </FieldTitle>
              <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors w-auto">
                <span>2</span>
                <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </div>
            </Field>

            {/* Field 6: Podcast */}
            <Field
              orientation="horizontal"
              className="py-4 items-center justify-between gap-3 cursor-pointer group"
            >
              <FieldContent className="gap-0.5">
                <FieldTitle className="text-[13px] font-semibold text-white tracking-tight">
                  Podcast
                </FieldTitle>
                <FieldDescription className="text-xs text-neutral-500">
                  + Link to your podcast
                </FieldDescription>
              </FieldContent>
              <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
            </Field>

            {/* Field 7: Show Instagram badge toggle */}
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
                className="data-checked:bg-white data-unchecked:bg-neutral-700 shrink-0 w-auto"
              />
            </Field>

            {/* Field 8: Show recent views toggle */}
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
                className="data-checked:bg-white data-unchecked:bg-neutral-700 shrink-0 mt-0.5 w-auto"
              />
            </Field>

            {/* Field 9: Profile privacy */}
            <Field className="py-4 gap-1.5 cursor-pointer group">
              <div className="flex items-center justify-between">
                <FieldTitle className="text-[13px] font-semibold text-white tracking-tight">
                  Profile privacy
                </FieldTitle>
                <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors">
                  <span>Public</span>
                  <RiArrowRightSLine className="size-5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
                </div>
              </div>
              <FieldDescription className="text-xs text-neutral-500 leading-relaxed pr-4">
                If you switch to private, only followers can see your threads. Your replies will be visible to followers and individual profiles you reply to.
              </FieldDescription>
            </Field>
          </FieldGroup>

          {/* Form Footer: Submit Button */}
          <div className="p-6 pt-2 border-white/5">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-sm cursor-pointer transition-colors active:scale-[0.99] shadow-sm"
            >
              Done
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
