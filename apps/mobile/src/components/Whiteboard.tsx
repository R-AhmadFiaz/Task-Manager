import React from "react";
import { StyleSheet, View } from "react-native";
import { useWhiteboard } from "../hooks/useWhiteboard";
import { WhiteboardToolbar } from "./WhiteboardToolbar";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

export function Whiteboard() {
  const {
    containerRef,
    onLayout,
    strokes,
    currentStroke,
    color,
    setColor,
    brushSize,
    setBrushSize,
    clear,
    panHandlers,
  } = useWhiteboard();

  return (
    <View style={styles.container}>
      <WhiteboardToolbar
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onClear={clear}
      />
      <WhiteboardCanvas
        containerRef={containerRef}
        onLayout={onLayout}
        strokes={strokes}
        currentStroke={currentStroke}
        panHandlers={panHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
