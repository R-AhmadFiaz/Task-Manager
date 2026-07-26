import type { Point } from "../types/whiteboard";

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Builds an SVG path `d` string for a full stroke, using a quadratic curve
 * through midpoints for a smooth line — same curve-fitting approach as the
 * desktop/web canvas renderer's `drawFullStroke`, just emitting SVG path
 * commands (`M`/`Q`/`L`) instead of CanvasRenderingContext2D calls, since
 * React Native has no DOM canvas and react-native-svg renders declarative
 * `<Path>` elements instead.
 */
export function buildStrokePath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    // A single point (tap with no movement) — draw a tiny dot as a short line
    // back onto itself so it still renders with round line caps.
    const { x, y } = points[0];
    return `M ${x} ${y} L ${x} ${y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mid = midpoint(points[i], points[i + 1]);
    d += ` Q ${points[i].x} ${points[i].y} ${mid.x} ${mid.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
