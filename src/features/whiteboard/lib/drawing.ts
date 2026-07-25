import type { Point, Stroke } from "@/features/whiteboard/types/whiteboard";

function applyBrush(ctx: CanvasRenderingContext2D, color: string, size: number): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Draws a filled dot so a tap/click with no movement still leaves a mark. */
export function drawDot(ctx: CanvasRenderingContext2D, point: Point, color: string, size: number): void {
  applyBrush(ctx, color, size);
  ctx.beginPath();
  ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws only the newest segment of an in-progress stroke, using a
 * quadratic curve through midpoints for a smooth line without redrawing
 * everything drawn so far. `points` is the full buffer collected up to
 * (and including) the latest pointer position.
 */
export function extendStroke(ctx: CanvasRenderingContext2D, points: Point[], color: string, size: number): void {
  const len = points.length;
  if (len < 2) return;

  applyBrush(ctx, color, size);

  const p0 = points[len - 2];
  const p1 = points[len - 1];
  const mid = midpoint(p0, p1);

  ctx.beginPath();
  if (len < 3) {
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(mid.x, mid.y);
  } else {
    const prevMid = midpoint(points[len - 3], p0);
    ctx.moveTo(prevMid.x, prevMid.y);
    ctx.quadraticCurveTo(p0.x, p0.y, mid.x, mid.y);
  }
  ctx.stroke();
}

/** Replays an entire completed stroke from scratch — used only on redraw (e.g. after a resize). */
export function drawFullStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const { points, color, size } = stroke;
  if (points.length === 0) return;

  if (points.length === 1) {
    drawDot(ctx, points[0], color, size);
    return;
  }

  applyBrush(ctx, color, size);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const mid = midpoint(points[i], points[i + 1]);
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

export function redrawAll(ctx: CanvasRenderingContext2D, width: number, height: number, strokes: Stroke[]): void {
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    drawFullStroke(ctx, stroke);
  }
}
