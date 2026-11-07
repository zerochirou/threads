import { Sidebar } from "@/features/commons";
import { ContentScrollbar } from "@/features/content-scrollbar";
import { FollowSuggestions } from "@/features/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Kolom Kiri: flex-1 menyerap sisa ruang di kiri */}
      <div className="flex-1 flex justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      {/* Kolom Tengah: feed dengan ukuran pasti (668px), berada tepat di tengah layar */}
      <main className="w-full max-w-[668px] shrink-0 overflow-hidden">
        <ContentScrollbar />
      </main>

      {/* Kolom Kanan: flex-1 menyerap sisa ruang yang sama di kanan */}
      <div className="flex-1 hidden xl:flex justify-end">
        <FollowSuggestions className="sticky top-0" />
      </div>
    </div>
  );
}
