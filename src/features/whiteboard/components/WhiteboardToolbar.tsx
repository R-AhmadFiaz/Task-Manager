"use client";

import { MAX_BRUSH_SIZE, MIN_BRUSH_SIZE, WHITEBOARD_COLORS } from "@/features/whiteboard/lib/constants";

interface WhiteboardToolbarProps {
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

export function WhiteboardToolbar({
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onClear,
}: WhiteboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Color</span>
        <div className="flex items-center gap-1.5">
          {WHITEBOARD_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onColorChange(swatch)}
              aria-label={`Use ${swatch} as the brush color`}
              aria-pressed={color === swatch}
              className={`h-6 w-6 cursor-pointer rounded-full border-2 ${
                color === swatch ? "border-gray-900" : "border-transparent"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <label className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 text-[10px] text-gray-400">
            <span aria-hidden className="pointer-events-none">
              +
            </span>
            <input
              type="color"
              value={color}
              onChange={(event) => onColorChange(event.target.value)}
              aria-label="Choose a custom brush color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="whiteboard-brush-size" className="text-sm text-gray-600">
          Brush
        </label>
        <input
          id="whiteboard-brush-size"
          type="range"
          min={MIN_BRUSH_SIZE}
          max={MAX_BRUSH_SIZE}
          value={brushSize}
          onChange={(event) => onBrushSizeChange(Number(event.target.value))}
          className="w-24 cursor-pointer accent-gray-900"
        />
        <span className="w-5 text-right text-sm text-gray-500">{brushSize}</span>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
}
