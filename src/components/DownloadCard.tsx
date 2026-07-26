import type { ReactNode } from "react";
import Link from "next/link";

type DownloadStatus = "available" | "coming-soon";

interface DownloadCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  status: DownloadStatus;
  buttonLabel: string;
  href: string;
  /** File downloads set this to the saved filename; internal navigation (the Web App card) omits it. */
  download?: string;
  /** Shown instead of the button when status is "coming-soon". */
  unavailableMessage?: string;
}

const buttonClassName =
  "mt-6 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800";

export function DownloadCard({
  icon,
  title,
  description,
  status,
  buttonLabel,
  href,
  download,
  unavailableMessage,
}: DownloadCardProps) {
  const isAvailable = status === "available";
  // File downloads must be plain anchors with a `download` attribute so the
  // browser saves the file. Same-site navigation (the Web App card) has no
  // `download` — use next/link's client-side router for that instead of a
  // full page reload, so it can never point at a stale, previously-cached
  // page or behave differently from the rest of the app's internal links.
  const isFileDownload = download !== undefined;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
          {icon}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isAvailable ? "Available" : "Coming Soon"}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500">{description}</p>

      {!isAvailable ? (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
        >
          {unavailableMessage ?? "Not available yet."}
        </button>
      ) : isFileDownload ? (
        <a href={href} download={download} className={buttonClassName}>
          {buttonLabel}
        </a>
      ) : (
        <Link href={href} className={buttonClassName}>
          {buttonLabel}
        </Link>
      )}
    </div>
  );
}
