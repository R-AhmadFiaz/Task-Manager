"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { drawDot, extendStroke, redrawAll } from "@/features/whiteboard/lib/drawing";
import { DEFAULT_BRUSH_SIZE, DEFAULT_COLOR } from "@/features/whiteboard/lib/constants";
import type { Point, Stroke } from "@/features/whiteboard/types/whiteboard";

interface UseWhiteboardResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  clear: () => void;
  handlePointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
}

/**
 * Owns all whiteboard drawing state and canvas lifecycle. Only `color` and
 * `brushSize` are React state (they drive toolbar UI); everything touched
 * during an active stroke — points, drawing flag, committed strokes — lives
 * in refs so a pointer move never triggers a React re-render.
 */
export function useWhiteboard(): UseWhiteboardResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [color, setColor] = useState(DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);

  // "Latest ref" pattern: pointer handlers below are created once (stable
  // identity) and read the current settings through these refs, instead of
  // needing to be recreated whenever color/brushSize change.
  const colorRef = useRef(color);
  colorRef.current = color;
  const brushSizeRef = useRef(brushSize);
  brushSizeRef.current = brushSize;

  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[] | null>(null);
  const isDrawingRef = useRef(false);
  const rectRef = useRef<DOMRect | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const getPoint = useCallback((event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = rectRef.current;
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      // Cached once per stroke so pointermove (which can fire at high
      // frequency) never forces a synchronous layout read.
      rectRef.current = event.currentTarget.getBoundingClientRect();

      const point = getPoint(event);
      isDrawingRef.current = true;
      currentStrokeRef.current = [point];
      drawDot(ctx, point, colorRef.current, brushSizeRef.current);
    },
    [getPoint],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      const point = getPoint(event);
      currentStrokeRef.current.push(point);
      extendStroke(ctx, currentStrokeRef.current, colorRef.current, brushSizeRef.current);
    },
    [getPoint],
  );

  const finishStroke = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    strokesRef.current.push({
      points: currentStrokeRef.current,
      color: colorRef.current,
      size: brushSizeRef.current,
    });
    currentStrokeRef.current = null;
  }, []);

  const clear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    isDrawingRef.current = false;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Owns the canvas pixel buffer: sizes it to the container (accounting for
  // device pixel ratio), and on every resize proportionally rescales
  // already-drawn strokes before replaying them, so drawings survive a
  // resize instead of being stretched, cropped, or wiped.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const previous = sizeRef.current;
      if (previous.width > 0 && previous.height > 0) {
        const scaleX = width / previous.width;
        const scaleY = height / previous.height;
        if (scaleX !== 1 || scaleY !== 1) {
          strokesRef.current = strokesRef.current.map((stroke) => ({
            ...stroke,
            points: stroke.points.map((point) => ({ x: point.x * scaleX, y: point.y * scaleY })),
          }));
        }
      }
      sizeRef.current = { width, height };

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Resizing the canvas element resets its transform, so this must be
      // reapplied every time rather than accumulating.
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;

      redrawAll(ctx, width, height, strokesRef.current);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return {
    canvasRef,
    containerRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    clear,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: finishStroke,
  };
}
