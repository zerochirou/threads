import { Sidebar } from "@/features/commons";
import { ThreadDetailView } from "@/features/content-scrollbar";
import { FollowSuggestions } from "@/features/home";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="hidden md:flex md:flex-1 justify-start">
        <Sidebar className="sticky top-0" />
      </div>

      <main className="w-full max-w-[668px] shrink-0 overflow-x-hidden">
        <ThreadDetailView threadId={id} />
      </main>

      <div className="md:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 hidden xl:flex justify-end">
        <FollowSuggestions className="sticky top-0" />
      </div>
    </div>
  );
}
