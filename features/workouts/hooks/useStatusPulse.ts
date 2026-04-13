import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

/**
 * Very subtle pulse animation used for active workout indicators.
 */
export function useStatusPulse(isActive: boolean): Animated.Value {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.98,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [isActive, pulse]);

  return pulse;
}
