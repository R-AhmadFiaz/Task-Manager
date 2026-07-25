"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

interface WhiteboardCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
}

export function WhiteboardCanvas({
  containerRef,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: WhiteboardCanvasProps) {
  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="h-full w-full touch-none cursor-crosshair"
        role="img"
        aria-label="Whiteboard drawing area. Click or tap and drag to draw."
      />
    </div>
  );
}
