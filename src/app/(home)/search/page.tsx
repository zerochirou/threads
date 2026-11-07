import { Sidebar } from "@/features/commons";
import { SearchView } from "@/features/search";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Kolom Kiri: Sidebar */}
      <div className="flex-1 flex justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      {/* Kolom Tengah: Search View (668px) yang persis seimbang */}
      <main className="w-full max-w-[668px] shrink-0 overflow-hidden">
        <SearchView />
      </main>

      {/* Kolom Kanan: Penyeimbang simetris seperti pada gambar Threads Search */}
      <div className="flex-1 hidden xl:flex justify-end" />
    </div>
  );
}
