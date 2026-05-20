import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ScreenContainer from "../../components/ui/ScreenContainer";
import ThemedButton from "../../components/ui/ThemedButton";
import { onboardingSteps } from "../../constants/mockData";
import { colors, gradients, radius, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function ProgressDot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const progress = useSharedValue(index === activeIndex ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(index === activeIndex ? 1 : 0, { duration: 250 });
  }, [activeIndex, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: index === activeIndex ? colors.primaryLight : colors.surfaceElevated,
    width: interpolate(progress.value, [0, 1], [8, 28]),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  const { completeOnboarding } = useAuth();

  useEffect(() => {
    translateX.value = withSpring(-activeIndex * width, { damping: 18, stiffness: 120 });
  }, [activeIndex, translateX, width]);

  const animatedSlides = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleNext = async () => {
    if (activeIndex < onboardingSteps.length - 1) {
      setActiveIndex((index) => index + 1);
      return;
    }

    await completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>Ford+</Text>
        <Text style={styles.tagline}>Seu Ford, sempre em dia.</Text>
      </View>

      <View style={styles.viewport}>
        <Animated.View style={[styles.slides, { width: width * onboardingSteps.length }, animatedSlides]}>
          {onboardingSteps.map((step) => (
            <View key={step.id} style={[styles.slide, { width }]}>
              <View style={styles.iconHalo}>
                <MaterialCommunityIcons name={step.icon as IconName} size={76} color={colors.white} />
              </View>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingSteps.map((step, index) => (
            <ProgressDot key={step.id} index={index} activeIndex={activeIndex} />
          ))}
        </View>
        <ThemedButton
          title={activeIndex === onboardingSteps.length - 1 ? "Comecar" : "Continuar"}
          icon={activeIndex === onboardingSteps.length - 1 ? "check" : "arrow-right"}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  brand: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  logo: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: "900",
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
  },
  slides: {
    flexDirection: "row",
    height: "100%",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  iconHalo: {
    alignItems: "center",
    backgroundColor: gradients.vehicle[0],
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.xl,
    borderWidth: 1,
    height: 156,
    justifyContent: "center",
    marginBottom: spacing.xxl,
    width: 156,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  footer: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  dot: {
    borderRadius: radius.round,
    height: 8,
  },
  button: {
    minHeight: 52,
  },
});
