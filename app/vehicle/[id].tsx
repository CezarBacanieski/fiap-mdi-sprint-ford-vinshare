import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import MaintenanceChart from "../../components/charts/MaintenanceChart";
import HealthBar from "../../components/ui/HealthBar";
import ProgressRing from "../../components/ui/ProgressRing";
import ScreenContainer from "../../components/ui/ScreenContainer";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedCard from "../../components/ui/ThemedCard";
import { maintenanceRecommendations } from "../../constants/mockData";
import { colors, gradients, spacing, typography } from "../../constants/theme";
import { useServices } from "../../hooks/useServices";
import { useVehicles } from "../../hooks/useVehicles";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const systemLabels = [
  ["Motor", "motor"],
  ["Freios", "freios"],
  ["Pneus", "pneus"],
  ["Suspensao", "suspensao"],
  ["Ar Condicionado", "arCondicionado"],
  ["Fluidos", "fluidos"],
] as const;

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { historyServices, isLoading: servicesLoading } = useServices();
  const vehicle = vehicles.find((item) => item.id === id);
  const services = historyServices.filter((service) => service.vehicleId === id);
  const recommendations = maintenanceRecommendations.filter((item) => item.vehicleId === id);

  if (vehiclesLoading || servicesLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Carregando veiculo...</Text>
      </ScreenContainer>
    );
  }

  if (!vehicle) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <MaterialCommunityIcons name="car-off" size={48} color={colors.textMuted} />
        <Text style={styles.title}>Veiculo nao encontrado</Text>
        <ThemedButton title="Voltar" onPress={() => router.back()} style={styles.backButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={34}
          color={colors.textPrimary}
          onPress={() => router.back()}
        />
        <Text style={styles.topTitle}>Detalhes</Text>
        <View style={styles.placeholder} />
      </View>

      <ThemedCard gradient={gradients.blueCard} style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.vehicleName}>{vehicle.model}</Text>
            <Text style={styles.vehicleMeta}>
              {vehicle.year} - {vehicle.version}
            </Text>
          </View>
          <ProgressRing score={vehicle.healthScore} size={96} />
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Placa</Text>
            <Text style={styles.infoValue}>{vehicle.plate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>KM</Text>
            <Text style={styles.infoValue}>{vehicle.mileage.toLocaleString("pt-BR")}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cor</Text>
            <Text style={styles.infoValue}>{vehicle.color}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Chassi</Text>
            <Text style={styles.infoValue}>{vehicle.chassi}</Text>
          </View>
        </View>
      </ThemedCard>

      <Text style={styles.sectionHeader}>SAUDE POR SISTEMA</Text>
      <ThemedCard style={styles.sectionCard}>
        <MaintenanceChart systems={vehicle.systems} />
        <View style={styles.healthList}>
          {systemLabels.map(([label, key]) => (
            <HealthBar key={key} label={label} value={vehicle.systems[key]} />
          ))}
        </View>
      </ThemedCard>

      <Text style={styles.sectionHeader}>RECOMENDACOES</Text>
      {recommendations.map((item) => (
        <ThemedCard key={item.id} style={styles.recommendationCard}>
          <View style={styles.recommendationRow}>
            <View style={styles.recommendationIcon}>
              <MaterialCommunityIcons name={item.icon as IconName} size={26} color={colors.primaryLight} />
            </View>
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>{item.name}</Text>
              <Text style={styles.recommendationDescription}>{item.description}</Text>
            </View>
            <StatusBadge label={item.urgency} />
          </View>
        </ThemedCard>
      ))}

      <Text style={styles.sectionHeader}>LINHA DO TEMPO</Text>
      <View style={styles.timeline}>
        {services.map((service, index) => (
          <View key={service.id} style={styles.timelineItem}>
            <View style={styles.timelineMarker}>
              <View style={styles.dot} />
              {index < services.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <ThemedCard style={styles.timelineCard}>
              <View style={styles.timelineTop}>
                <Text style={styles.timelineDate}>
                  {format(parseISO(service.date), "dd MMM yyyy", { locale: ptBR })}
                </Text>
                <StatusBadge label={service.status} />
              </View>
              <Text style={styles.timelineTitle}>{service.type}</Text>
              <Text style={styles.timelineMeta}>
                {service.mileage.toLocaleString("pt-BR")} km - {service.dealershipName}
              </Text>
              {service.cost ? (
                <Text style={styles.timelineCost}>
                  {service.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
              ) : null}
            </ThemedCard>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <ThemedButton
          title="Ver historico completo"
          variant="outline"
          icon="clipboard-text-clock"
          onPress={() => router.push("/(tabs)/services")}
          style={styles.actionButton}
        />
        <ThemedButton
          title="Agendar revisao"
          icon="calendar-plus"
          onPress={() => router.push("/service/new")}
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  topTitle: {
    ...typography.header,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 34,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  backButton: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
  heroCard: {
    marginBottom: spacing.xl,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  vehicleName: {
    ...typography.title,
    color: colors.textPrimary,
  },
  vehicleMeta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  infoItem: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: spacing.md,
    width: "47.8%",
  },
  infoLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.xl,
  },
  healthList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  recommendationCard: {
    marginBottom: spacing.md,
  },
  recommendationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  recommendationIcon: {
    alignItems: "center",
    backgroundColor: "rgba(27,92,255,0.14)",
    borderRadius: 10,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  recommendationDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timeline: {
    marginBottom: spacing.xl,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineMarker: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    height: 12,
    marginTop: spacing.lg,
    width: 12,
  },
  line: {
    backgroundColor: colors.border,
    flex: 1,
    width: 2,
  },
  timelineCard: {
    flex: 1,
    marginBottom: spacing.md,
  },
  timelineTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timelineTitle: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  timelineMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timelineCost: {
    ...typography.body,
    color: colors.success,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    minHeight: 52,
  },
});
