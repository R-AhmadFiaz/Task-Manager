import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/actions";
import { DashboardHeader } from "@/features/tasks/components/DashboardHeader";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { WhiteboardSection } from "@/features/whiteboard/components/WhiteboardSection";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route; this check covers direct
  // server-side renders (e.g. a stale/invalid session cookie).
  if (!user) {
    redirect("/login");
  }

  const tasks = await getTasks();

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-8">
        <TaskBoard tasks={tasks} userId={user.id} />
        <WhiteboardSection />
      </div>
    </main>
  );
}
