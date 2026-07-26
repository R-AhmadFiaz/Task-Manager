import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  type GestureResponderHandlers,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { buildStrokePath } from "../lib/svgPath";
import type { Stroke } from "../types/whiteboard";
import { colors } from "../theme";

interface WhiteboardCanvasProps {
  containerRef: React.RefObject<View | null>;
  onLayout: () => void;
  strokes: Stroke[];
  currentStroke: Stroke | null;
  panHandlers: GestureResponderHandlers;
}

// react-native's own CursorValue type only allows 'auto' | 'pointer', but
// react-native-web forwards `cursor` straight through as the CSS property,
// which supports the full CSS cursor keyword set (including 'crosshair').
// The cast is only to work around that overly-narrow upstream type — it has
// no effect on the value actually applied.
const webCrosshairStyle =
  Platform.OS === "web" ? ({ cursor: "crosshair" } as unknown as ViewStyle) : undefined;

export function WhiteboardCanvas({
  containerRef,
  onLayout,
  strokes,
  currentStroke,
  panHandlers,
}: WhiteboardCanvasProps) {
  return (
    <View
      ref={containerRef}
      onLayout={onLayout}
      style={[styles.container, webCrosshairStyle]}
      {...panHandlers}
    >
      {/* pointerEvents="none" keeps every touch/click landing on this View
          (and its panHandlers) regardless of what's drawn — without it, on
          web a pointer over an existing stroke's <Path> would report
          coordinates relative to that path's own small bounding box instead
          of the canvas, so only slivers of the canvas would accept
          drawing. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {strokes.map((stroke, index) => (
          <Path
            key={index}
            d={buildStrokePath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.size}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
        {currentStroke && (
          <Path
            d={buildStrokePath(currentStroke.points)}
            stroke={currentStroke.color}
            strokeWidth={currentStroke.size}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
});
