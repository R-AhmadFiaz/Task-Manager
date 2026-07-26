import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BRUSH_STEP, MAX_BRUSH_SIZE, MIN_BRUSH_SIZE, WHITEBOARD_COLORS } from "../lib/whiteboardConstants";
import { colors } from "../theme";

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
  function step(delta: number) {
    const next = Math.min(MAX_BRUSH_SIZE, Math.max(MIN_BRUSH_SIZE, brushSize + delta));
    onBrushSizeChange(next);
  }

  return (
    <View style={styles.toolbar}>
      <View style={styles.group}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.swatches}>
          {WHITEBOARD_COLORS.map((swatch) => (
            <TouchableOpacity
              key={swatch}
              style={[styles.swatch, { backgroundColor: swatch }, color === swatch && styles.swatchSelected]}
              onPress={() => onColorChange(swatch)}
              accessibilityRole="button"
              accessibilityLabel={`Use ${swatch} as the brush color`}
              accessibilityState={{ selected: color === swatch }}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Brush</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => step(-BRUSH_STEP)}
            accessibilityRole="button"
            accessibilityLabel="Decrease brush size"
          >
            <Text style={styles.stepButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.brushValue}>{brushSize}</Text>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => step(BRUSH_STEP)}
            accessibilityRole="button"
            accessibilityLabel="Increase brush size"
          >
            <Text style={styles.stepButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={onClear} accessibilityRole="button">
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  swatches: {
    flexDirection: "row",
    gap: 6,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  brushValue: {
    fontSize: 13,
    color: colors.textSecondary,
    minWidth: 20,
    textAlign: "center",
  },
  clearButton: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
