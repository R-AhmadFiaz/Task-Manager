import { SiteNav } from "@/components/SiteNav";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <SiteNav />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-4xl font-semibold text-gray-900">Task Manager</h1>
        <p className="text-gray-500">Simple, focused task management.</p>
      </div>
    </main>
  );
}
