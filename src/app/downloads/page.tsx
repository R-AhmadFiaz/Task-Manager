import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isDownloadAvailable } from "@/lib/downloads";
import { DownloadCard } from "@/components/DownloadCard";
import { AndroidIcon, BrowserIcon, DesktopIcon, PuzzleIcon } from "@/components/DownloadIcons";
import { SiteNav } from "@/components/SiteNav";

export default async function DownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // "Open the web app" only ever means "go somewhere useful inside this same
  // site" — never back to /login, since visiting Downloads never requires
  // signing in. Logged-in users land on their dashboard; everyone else lands
  // on the marketing home page.
  const webAppHref = user ? "/dashboard" : "/";
  const webAppLabel = user ? "Open Dashboard" : "Open Web App";

  const desktopAvailable = isDownloadAvailable("downloads/desktop/TaskManager-Setup.msi");
  const androidAvailable = isDownloadAvailable("downloads/android/TaskManager.apk");
  const chromeExtensionAvailable = isDownloadAvailable(
    "downloads/chrome-extension/task-manager-chrome-extension.zip",
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteNav isAuthenticated={!!user} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Downloads</h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-500">
            Get Task Manager on any platform — web, desktop, Android, or as a Chrome extension.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DownloadCard
            icon={<BrowserIcon />}
            title="Web Application"
            description="Use Task Manager directly in your browser — no install required, and works on any device with an internet connection."
            status="available"
            buttonLabel={webAppLabel}
            href={webAppHref}
          />

          <DownloadCard
            icon={<DesktopIcon />}
            title="Desktop Application"
            description="A native Windows app built with Tauri for offline-first task management, including the whiteboard, right on your desktop."
            status={desktopAvailable ? "available" : "coming-soon"}
            buttonLabel="Download for Windows"
            href="/downloads/desktop/TaskManager-Setup.msi"
            download="TaskManager-Setup.msi"
            unavailableMessage="Windows installer not available yet."
          />

          <DownloadCard
            icon={<AndroidIcon />}
            title="Android Application"
            description="Built with Expo. A packaged Android app hasn't been generated yet — the web app above already works great on mobile browsers."
            status={androidAvailable ? "available" : "coming-soon"}
            buttonLabel="Download Android App"
            href="/downloads/android/TaskManager.apk"
            download="TaskManager.apk"
            unavailableMessage="APK build not generated yet."
          />

          <DownloadCard
            icon={<PuzzleIcon />}
            title="Chrome Extension"
            description="Quickly add tasks from any tab without leaving your browser. Load it as an unpacked extension in Chrome."
            status={chromeExtensionAvailable ? "available" : "coming-soon"}
            buttonLabel="Download Chrome Extension"
            href="/downloads/chrome-extension/task-manager-chrome-extension.zip"
            download="task-manager-chrome-extension.zip"
            unavailableMessage="Extension package not available yet."
          />
        </div>

        <p className="mt-12 text-center text-sm text-gray-500">
          <Link href="/" className="font-medium text-gray-900 underline underline-offset-2">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
