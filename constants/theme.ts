import { MD3DarkTheme } from "react-native-paper";

export const colors = {
  primary: "#003499",
  primaryLight: "#1B5CFF",
  accent: "#C8102E",
  background: "#0A0A0A",
  surface: "#161616",
  surfaceElevated: "#222222",
  surfaceSoft: "#1B1B1B",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#6F6F6F",
  success: "#00C853",
  warning: "#FFD600",
  border: "#2A2A2A",
  black: "#000000",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800" as const,
  },
  header: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800" as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600" as const,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800" as const,
    textTransform: "uppercase" as const,
  },
} as const;

export const gradients = {
  card: ["#202020", "#121212"] as const,
  blueCard: ["#003499", "#061A42", "#111111"] as const,
  redAlert: ["#C8102E", "#62101D"] as const,
  yellowAlert: ["#FFD600", "#5B4D00"] as const,
  vehicle: ["#0B3FAD", "#04183F"] as const,
  premium: ["#222222", "#141414", "#0A0A0A"] as const,
} as const;

export const shadow = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 8,
} as const;

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceElevated,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.accent,
  },
} as const;

export const getHealthColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 50) return colors.warning;
  return colors.accent;
};
