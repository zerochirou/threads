import { Sidebar } from "@/features/commons";
import { SearchView } from "@/features/search";

export default function SearchPage() {
  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="hidden md:flex md:flex-1 justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      <main className="w-full max-w-[668px] shrink-0 overflow-x-hidden">
        <SearchView />
      </main>

      <div className="md:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 hidden xl:flex justify-end" />
    </div>
  );
}
