"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SiteNavProps {
  /** Downloads is the only public page a signed-in user can land on, so it's
   * the only place this needs to be passed explicitly (from data the page
   * already fetches server-side) — Home/Login/Register are unreachable
   * while signed in (middleware redirects to /dashboard first). */
  isAuthenticated?: boolean;
}

const navLinkBase = "rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50";

// "Active" always renders as a ring — a mechanism distinct from hover's fill
// swap — so it stays visually distinguishable no matter which base style
// (solid dark vs. bordered) it's layered on top of.
const activeRing = "ring-2 ring-gray-900 ring-offset-2 ring-offset-gray-50";

const primaryStyle = "bg-gray-900 text-white hover:bg-black";
const secondaryStyle = "border border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white";

export function SiteNav({ isAuthenticated = false }: SiteNavProps) {
  const pathname = usePathname();

  function linkClassName(href: string, style: string) {
    const isActive = pathname === href;
    return `${navLinkBase} ${style} ${isActive ? activeRing : ""}`;
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <span className="text-sm font-semibold text-gray-900">Task Manager</span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {isAuthenticated ? (
          <Link href="/dashboard" className={linkClassName("/dashboard", primaryStyle)}>
            Dashboard
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className={linkClassName("/login", primaryStyle)}>
              Login
            </Link>
            <Link href="/register" className={linkClassName("/register", secondaryStyle)}>
              Register
            </Link>
          </div>
        )}
        <Link href="/downloads" className={linkClassName("/downloads", secondaryStyle)}>
          Downloads
        </Link>
      </div>
    </nav>
  );
}
