import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors, getHealthColor } from "../../constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ProgressRing({
  score,
  size = 88,
  strokeWidth = 9,
  showLabel = true,
}: ProgressRingProps) {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const healthColor = getHealthColor(score);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(score, 100)) / 100, { duration: 900 });
  }, [progress, score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={healthColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {showLabel ? (
        <View style={styles.labelContainer}>
          <Text style={[styles.score, { color: healthColor }]}>{score}</Text>
          <Text style={styles.caption}>score</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  score: {
    fontSize: 20,
    fontWeight: "900",
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
