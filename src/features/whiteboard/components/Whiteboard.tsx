"use client";

import { useWhiteboard } from "@/features/whiteboard/hooks/useWhiteboard";
import { WhiteboardToolbar } from "@/features/whiteboard/components/WhiteboardToolbar";
import { WhiteboardCanvas } from "@/features/whiteboard/components/WhiteboardCanvas";

export function Whiteboard() {
  const {
    canvasRef,
    containerRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    clear,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useWhiteboard();

  return (
    <div className="space-y-3">
      <WhiteboardToolbar
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onClear={clear}
      />
      <WhiteboardCanvas
        containerRef={containerRef}
        canvasRef={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}
