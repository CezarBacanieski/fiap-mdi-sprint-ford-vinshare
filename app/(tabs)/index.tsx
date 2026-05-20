import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import NotificationBell from "../../components/ui/NotificationBell";
import ProgressRing from "../../components/ui/ProgressRing";
import ScreenContainer from "../../components/ui/ScreenContainer";
import ServiceCard from "../../components/ui/ServiceCard";
import SkeletonBox from "../../components/ui/SkeletonBox";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedCard from "../../components/ui/ThemedCard";
import { maintenanceRecommendations } from "../../constants/mockData";
import { colors, getHealthColor, gradients, radius, spacing, typography } from "../../constants/theme";
import { useNotifications } from "../../hooks/useNotifications";
import { useRewards } from "../../hooks/useRewards";
import { useServices } from "../../hooks/useServices";
import { useVehicles } from "../../hooks/useVehicles";
import { ServiceRecord } from "../../types";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function AnimatedSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 420 }));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

const quickActions = [
  { label: "Historico", icon: "clipboard-text-clock-outline" as IconName, route: "/(tabs)/services" },
  { label: "Agendar", icon: "calendar-plus" as IconName, route: "/service/new" },
  { label: "Pontos", icon: "trophy-outline" as IconName, route: "/(tabs)/rewards" },
  { label: "Concessionarias", icon: "map-marker-radius-outline" as IconName, route: "/service/new" },
] as const;

const getAlertTone = (service: ServiceRecord | undefined) => {
  if (!service) return { gradient: gradients.card, label: "Sem pendencias", days: 0 };
  const days = differenceInCalendarDays(parseISO(service.date), new Date());
  if (days < 0) return { gradient: gradients.redAlert, label: "Servico atrasado", days };
  if (days <= 30) return { gradient: gradients.yellowAlert, label: "Proximo servico", days };
  return { gradient: gradients.blueCard, label: "Agendamento ativo", days };
};

export default function HomeScreen() {
  const { user, isLoading: rewardsLoading } = useRewards();
  const { vehicles, isLoading: vehiclesLoading, errorMessage } = useVehicles();
  const { upcomingServices, historyServices, isLoading: servicesLoading } = useServices();
  const { notificationCount, clearNotificationCount } = useNotifications();
  const isLoading = rewardsLoading || vehiclesLoading || servicesLoading;
  const primaryVehicle = vehicles[0];
  const nextService = upcomingServices[0];
  const alertTone = getAlertTone(nextService);
  const recommendations = primaryVehicle
    ? maintenanceRecommendations.filter((item) => item.vehicleId === primaryVehicle.id)
    : maintenanceRecommendations.slice(0, 3);

  if (isLoading) {
    return (
      <ScreenContainer>
        <SkeletonBox height={44} />
        <SkeletonBox height={230} style={styles.loadingGap} />
        <SkeletonBox height={112} style={styles.loadingGap} />
        <SkeletonBox height={180} style={styles.loadingGap} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedSection>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bom dia, {user?.name.split(" ")[0] ?? "Cliente"}!</Text>
            <Text style={styles.subtitle}>Seu Ford, sempre em dia.</Text>
          </View>
          <NotificationBell count={notificationCount} onPress={clearNotificationCount} />
        </View>
      </AnimatedSection>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {primaryVehicle ? (
        <AnimatedSection delay={80}>
          <ThemedCard gradient={gradients.blueCard} style={styles.primaryCard}>
            <View style={styles.vehicleHero}>
              <View style={styles.vehiclePhoto}>
                <Text style={styles.fordLogo}>FORD</Text>
                <MaterialCommunityIcons name="car-estate" size={88} color={colors.white} />
              </View>
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleTitleRow}>
                  <View style={styles.vehicleTitleBlock}>
                    <Text style={styles.vehicleTitle}>{primaryVehicle.model}</Text>
                    <Text style={styles.vehicleSubtitle}>
                      {primaryVehicle.year} - {primaryVehicle.plate}
                    </Text>
                  </View>
                  <StatusBadge label={primaryVehicle.fuelType} tone="info" />
                </View>
                <View style={styles.healthRow}>
                  <View>
                    <Text style={styles.kmLabel}>Quilometragem</Text>
                    <Text style={styles.kmValue}>
                      {primaryVehicle.mileage.toLocaleString("pt-BR")} km
                    </Text>
                  </View>
                  <ProgressRing score={primaryVehicle.healthScore} size={96} />
                </View>
                <Text style={[styles.healthText, { color: getHealthColor(primaryVehicle.healthScore) }]}>
                  Vehicle Health Score
                </Text>
              </View>
            </View>
          </ThemedCard>
        </AnimatedSection>
      ) : null}

      <AnimatedSection delay={140}>
        <ThemedCard gradient={alertTone.gradient} style={styles.alertCard}>
          <View style={styles.alertTop}>
            <View style={styles.alertIcon}>
              <MaterialCommunityIcons
                name={alertTone.days <= 30 ? "alert-decagram" : "calendar-check"}
                size={28}
                color={alertTone.days <= 30 ? colors.background : colors.white}
              />
            </View>
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertLabel}>{alertTone.label}</Text>
              <Text style={styles.alertTitle}>{nextService?.type ?? "Nenhum servico agendado"}</Text>
              <Text style={styles.alertMeta}>
                {nextService
                  ? `${format(parseISO(nextService.date), "dd MMM yyyy", { locale: ptBR })} - ${
                      nextService.dealershipName
                    }`
                  : "Agende sua proxima revisao na rede oficial Ford."}
              </Text>
            </View>
          </View>
          <ThemedButton
            title="Agendar Agora"
            icon="calendar-plus"
            onPress={() => router.push("/service/new")}
            variant={alertTone.days <= 30 ? "secondary" : "primary"}
            style={styles.alertButton}
          />
        </ThemedCard>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <Text style={styles.sectionHeader}>PROXIMAS MANUTENCOES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipList}>
          {recommendations.map((item) => (
            <ThemedCard key={item.id} style={styles.maintenanceChip} contentStyle={styles.chipContent}>
              <MaterialCommunityIcons name={item.icon as IconName} size={24} color={colors.primaryLight} />
              <Text style={styles.chipLabel}>{item.name}</Text>
              <Text style={styles.chipMeta}>
                {item.dueMileage
                  ? `${item.dueMileage.toLocaleString("pt-BR")} km`
                  : item.dueDate
                    ? format(parseISO(item.dueDate), "dd MMM", { locale: ptBR })
                    : "Em breve"}
              </Text>
            </ThemedCard>
          ))}
        </ScrollView>
      </AnimatedSection>

      <AnimatedSection delay={260}>
        <Text style={styles.sectionHeader}>ATALHOS</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <ThemedCard
              key={action.label}
              onPress={() => router.push(action.route)}
              style={styles.quickCard}
              contentStyle={styles.quickContent}
            >
              <MaterialCommunityIcons name={action.icon} size={28} color={colors.primaryLight} />
              <Text style={styles.quickLabel}>{action.label}</Text>
            </ThemedCard>
          ))}
        </View>
      </AnimatedSection>

      <AnimatedSection delay={320}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeader}>ATIVIDADE RECENTE</Text>
          <Text style={styles.link} onPress={() => router.push("/(tabs)/services")}>
            Ver tudo
          </Text>
        </View>
        {historyServices.slice(0, 3).map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </AnimatedSection>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  loadingGap: {
    marginTop: spacing.lg,
  },
  primaryCard: {
    marginBottom: spacing.lg,
  },
  vehicleHero: {
    gap: spacing.lg,
  },
  vehiclePhoto: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: radius.md,
    height: 140,
    justifyContent: "center",
    overflow: "hidden",
  },
  fordLogo: {
    color: "rgba(255,255,255,0.24)",
    fontSize: 52,
    fontWeight: "900",
    position: "absolute",
  },
  vehicleInfo: {
    gap: spacing.lg,
  },
  vehicleTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  vehicleTitleBlock: {
    flex: 1,
  },
  vehicleTitle: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: "900",
  },
  vehicleSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  healthRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  kmLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  kmValue: {
    color: colors.textPrimary,
    fontSize: 27,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  healthText: {
    ...typography.caption,
    textTransform: "uppercase",
  },
  alertCard: {
    marginBottom: spacing.xl,
  },
  alertTop: {
    flexDirection: "row",
    gap: spacing.md,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: radius.sm,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  alertTitle: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  alertMeta: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    opacity: 0.84,
  },
  alertButton: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chipList: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  maintenanceChip: {
    width: 148,
  },
  chipContent: {
    gap: spacing.sm,
    minHeight: 126,
  },
  chipLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  chipMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickCard: {
    width: "47.8%",
  },
  quickContent: {
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 96,
    justifyContent: "center",
  },
  quickLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: "center",
    textTransform: "uppercase",
  },
  sectionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: {
    ...typography.caption,
    color: colors.primaryLight,
    marginBottom: spacing.md,
  },
});
