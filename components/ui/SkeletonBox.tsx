import { useEffect } from "react";
import { DimensionValue, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors, radius } from "../../constants/theme";

interface SkeletonBoxProps {
  height: number;
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonBox({ height, width = "100%", style }: SkeletonBoxProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.surfaceElevated],
    ),
  }));

  const sizeStyle: StyleProp<ViewStyle> = { height, width };
  return <Animated.View style={[styles.box, sizeStyle, animatedStyle, style]} />;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
  },
});
