export const WHITEBOARD_COLORS = [
  "#111827", // near-black, matches the app's text color
  "#ef4444", // red
  "#f59e0b", // amber
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
] as const;

export const DEFAULT_COLOR: string = WHITEBOARD_COLORS[0];
export const DEFAULT_BRUSH_SIZE = 4;
export const MIN_BRUSH_SIZE = 1;
export const MAX_BRUSH_SIZE = 24;
