import { useCallback, useMemo, useRef, useState } from "react";
import { PanResponder, type GestureResponderEvent, type View } from "react-native";
import { DEFAULT_BRUSH_SIZE, DEFAULT_COLOR } from "../lib/whiteboardConstants";
import type { Point, Stroke } from "../types/whiteboard";

interface UseWhiteboardResult {
  containerRef: React.RefObject<View | null>;
  onLayout: () => void;
  strokes: Stroke[];
  currentStroke: Stroke | null;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  clear: () => void;
  panHandlers: ReturnType<typeof PanResponder.create>["panHandlers"];
}

/**
 * Owns whiteboard drawing state for the mobile app: strokes, the
 * in-progress stroke, and brush settings. Architecturally mirrors the
 * desktop/web `useWhiteboard` hook (same Point/Stroke data model, same
 * "collect points for the active stroke, commit on release" flow) — the
 * only real difference is the rendering surface: there is no DOM canvas in
 * React Native, so react-native-svg draws each stroke as a `<Path>` instead
 * of replaying draw calls onto a 2D context, and touch capture uses RN's
 * PanResponder instead of pointer events.
 */
export function useWhiteboard(): UseWhiteboardResult {
  const containerRef = useRef<View>(null);
  // Page-relative offset of the canvas container, refreshed on every
  // layout pass (mount, rotation, resize). `nativeEvent.locationX/locationY`
  // is relative to whatever DOM node/view actually received the touch —
  // on web that can be an individual <Path> once strokes exist, which only
  // covers a sliver of the canvas, so only that sliver would accept
  // drawing. `pageX/pageY` (always relative to the whole page/window) minus
  // this container offset is relative to the *container* no matter what
  // element underneath the finger/cursor triggered the event.
  const offsetRef = useRef({ x: 0, y: 0 });

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[] | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);

  // "Latest ref" pattern: the PanResponder below is created once (stable
  // identity) and reads current settings through these refs, instead of
  // needing to be recreated whenever color/brushSize change.
  const colorRef = useRef(color);
  colorRef.current = color;
  const brushSizeRef = useRef(brushSize);
  brushSizeRef.current = brushSize;
  const pointsRef = useRef<Point[]>([]);

  const onLayout = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      offsetRef.current = { x, y };
    });
  }, []);

  const pointFromEvent = useCallback((event: GestureResponderEvent): Point => {
    const { pageX, pageY } = event.nativeEvent;
    return { x: pageX - offsetRef.current.x, y: pageY - offsetRef.current.y };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Capture-phase counterparts of the two above: without these, the
        // whiteboard sits inside TasksScreen's FlatList (as its
        // ListFooterComponent), and on Android the FlatList's own scroll
        // responder can intercept a touch-move sequence — for its own
        // scroll gesture — before this bubble-phase responder ever claims
        // it, since real device touch dispatch does capture/bubble
        // arbitration that a web/mouse test never exercises. Returning true
        // here makes the canvas claim the gesture during the capture phase,
        // before the FlatList gets a chance to steal it.
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          const point = pointFromEvent(event);
          pointsRef.current = [point];
          setCurrentPoints([point]);
        },
        onPanResponderMove: (event) => {
          const point = pointFromEvent(event);
          pointsRef.current = [...pointsRef.current, point];
          setCurrentPoints(pointsRef.current);
        },
        onPanResponderRelease: () => {
          // Capture the finished stroke's points into a local constant
          // *before* resetting the ref. setStrokes's updater function isn't
          // invoked synchronously — React defers it to the reconciliation
          // pass, which runs after this handler returns. Reading
          // `pointsRef.current` from inside that updater (instead of a
          // local capture) meant it always saw the ref *after* the
          // `pointsRef.current = []` reset below, so every committed stroke
          // was stored with an empty points array — an invisible path —
          // which is why drawings vanished the instant the touch ended.
          const points = pointsRef.current;
          pointsRef.current = [];
          if (points.length > 0) {
            setStrokes((current) => [...current, { points, color: colorRef.current, size: brushSizeRef.current }]);
          }
          setCurrentPoints(null);
        },
        onPanResponderTerminate: () => {
          const points = pointsRef.current;
          pointsRef.current = [];
          if (points.length > 0) {
            setStrokes((current) => [...current, { points, color: colorRef.current, size: brushSizeRef.current }]);
          }
          setCurrentPoints(null);
        },
      }),
    [pointFromEvent],
  );

  function clear() {
    setStrokes([]);
    setCurrentPoints(null);
    pointsRef.current = [];
  }

  const currentStroke: Stroke | null = currentPoints ? { points: currentPoints, color, size: brushSize } : null;

  return {
    containerRef,
    onLayout,
    strokes,
    currentStroke,
    color,
    setColor,
    brushSize,
    setBrushSize,
    clear,
    panHandlers: panResponder.panHandlers,
  };
}
