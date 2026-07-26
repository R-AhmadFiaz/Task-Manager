import fs from "node:fs";
import path from "node:path";

/**
 * Checks whether a downloadable build actually exists under public/downloads
 * so the Downloads page can show real Available/Coming Soon status instead
 * of linking to a file that 404s. Run server-side only (uses node:fs) —
 * this is why the Downloads page itself is a Server Component.
 */
export function isDownloadAvailable(relativePathFromPublic: string): boolean {
  const absolutePath = path.join(process.cwd(), "public", relativePathFromPublic);
  try {
    const stats = fs.statSync(absolutePath);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}
