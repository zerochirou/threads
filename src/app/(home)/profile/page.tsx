import { Sidebar } from "@/features/commons";
import { FollowSuggestions } from "@/features/home";
import { ProfileView } from "@/features/profile";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Kolom Kiri: Sidebar */}
      <div className="flex-1 flex justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      {/* Kolom Tengah: Profile View (668px) */}
      <main className="w-full max-w-[668px] shrink-0 overflow-hidden">
        <ProfileView />
      </main>

      {/* Kolom Kanan: Follow suggestions */}
      <div className="flex-1 hidden xl:flex justify-end">
        <FollowSuggestions className="sticky top-0" />
      </div>
    </div>
  );
}
