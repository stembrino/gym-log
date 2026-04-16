import { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  Keyboard,
  ScrollView,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

type UseKeyboardInputAutoScrollArgs = {
  minClearance?: number;
  extraScroll?: number;
  focusDelayMs?: number;
};

export function useKeyboardInputAutoScroll({
  minClearance = 96,
  extraScroll = 32,
  focusDelayMs = 220,
}: UseKeyboardInputAutoScrollArgs = {}) {
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const focusedInputKeyRef = useRef<string | null>(null);

  const ensureInputVisible = useCallback(
    (input: TextInput | null) => {
      if (!input) {
        return;
      }

      requestAnimationFrame(() => {
        input.measureInWindow((_x, y, _w, height) => {
          const keyboardHeight = keyboardHeightRef.current;
          if (keyboardHeight <= 0) {
            return;
          }

          const screenHeight = Dimensions.get("window").height;
          const keyboardTopY = screenHeight - keyboardHeight;
          const desiredBottomY = keyboardTopY - minClearance;
          const inputBottomY = y + height;
          const overlap = inputBottomY - desiredBottomY;

          if (overlap > 0) {
            scrollRef.current?.scrollTo({
              y: Math.max(0, scrollOffsetYRef.current + overlap + extraScroll),
              animated: true,
            });
          }
        });
      });
    },
    [extraScroll, minClearance],
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      keyboardHeightRef.current = event.endCoordinates.height;

      const focusedKey = focusedInputKeyRef.current;
      if (focusedKey) {
        ensureInputVisible(inputRefs.current[focusedKey]);
      }
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardHeightRef.current = 0;
      focusedInputKeyRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [ensureInputVisible]);

  const setInputRef = useCallback((key: string, ref: TextInput | null) => {
    inputRefs.current[key] = ref;
  }, []);

  const handleInputFocus = useCallback(
    (key: string) => {
      focusedInputKeyRef.current = key;
      ensureInputVisible(inputRefs.current[key]);

      setTimeout(() => {
        if (focusedInputKeyRef.current === key) {
          ensureInputVisible(inputRefs.current[key]);
        }
      }, focusDelayMs);
    },
    [ensureInputVisible, focusDelayMs],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  return {
    scrollRef,
    setInputRef,
    handleInputFocus,
    handleScroll,
  };
}
