import { useWhiteboard } from "../hooks/useWhiteboard";
import { WhiteboardToolbar } from "./WhiteboardToolbar";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

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
    <div className="whiteboard">
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
