import { MAX_BRUSH_SIZE, MIN_BRUSH_SIZE, WHITEBOARD_COLORS } from "../lib/whiteboardConstants";

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
    <div className="whiteboard-toolbar">
      <div className="whiteboard-toolbar-group">
        <span className="whiteboard-toolbar-label">Color</span>
        <div className="whiteboard-swatches">
          {WHITEBOARD_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onColorChange(swatch)}
              aria-label={`Use ${swatch} as the brush color`}
              aria-pressed={color === swatch}
              className={`whiteboard-swatch${color === swatch ? " selected" : ""}`}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <label className="whiteboard-custom-color" aria-hidden={false}>
            <span aria-hidden className="whiteboard-custom-color-plus">
              +
            </span>
            <input
              type="color"
              value={color}
              onChange={(event) => onColorChange(event.target.value)}
              aria-label="Choose a custom brush color"
            />
          </label>
        </div>
      </div>

      <div className="whiteboard-toolbar-group">
        <label htmlFor="whiteboard-brush-size" className="whiteboard-toolbar-label">
          Brush
        </label>
        <input
          id="whiteboard-brush-size"
          type="range"
          min={MIN_BRUSH_SIZE}
          max={MAX_BRUSH_SIZE}
          value={brushSize}
          onChange={(event) => onBrushSizeChange(Number(event.target.value))}
          className="whiteboard-brush-slider"
        />
        <span className="whiteboard-brush-value">{brushSize}</span>
      </div>

      <button type="button" onClick={onClear} className="secondary-button whiteboard-clear-button">
        Clear
      </button>
    </div>
  );
}
