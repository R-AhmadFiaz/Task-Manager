// Prevents PostCSS's config search from walking up into the repo root and
// picking up the Next.js app's postcss.config.mjs (Tailwind plugin, not
// valid here) — this app uses plain CSS, so no plugins are needed.
export default {
  plugins: {},
};
