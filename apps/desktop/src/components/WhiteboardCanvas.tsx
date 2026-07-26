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
    <div ref={containerRef} className="whiteboard-canvas-container">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="whiteboard-canvas"
        role="img"
        aria-label="Whiteboard drawing area. Click and drag to draw."
      />
    </div>
  );
}
