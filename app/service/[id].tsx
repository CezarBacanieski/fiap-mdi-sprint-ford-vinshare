import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../components/ui/ScreenContainer";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedCard from "../../components/ui/ThemedCard";
import { colors, gradients, spacing, typography } from "../../constants/theme";
import { useServices } from "../../hooks/useServices";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services, isLoading } = useServices();
  const service = services.find((item) => item.id === id);

  if (isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Carregando servico...</Text>
      </ScreenContainer>
    );
  }

  if (!service) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <MaterialCommunityIcons name="calendar-remove" size={48} color={colors.textMuted} />
        <Text style={styles.title}>Servico nao encontrado</Text>
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
        <Text style={styles.topTitle}>Agendamento</Text>
        <View style={styles.placeholder} />
      </View>

      <ThemedCard gradient={gradients.blueCard} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="calendar-check" size={34} color={colors.white} />
          </View>
          <StatusBadge label={service.status} />
        </View>
        <Text style={styles.serviceType}>{service.type}</Text>
        <Text style={styles.vehicle}>{service.vehicleName}</Text>
        <Text style={styles.date}>
          {format(parseISO(service.date), "dd MMMM yyyy", { locale: ptBR })} - {service.time}
        </Text>
      </ThemedCard>

      <Text style={styles.sectionHeader}>CONCESSIONARIA</Text>
      <ThemedCard style={styles.card}>
        <Text style={styles.cardTitle}>{service.dealershipName}</Text>
        <Text style={styles.cardText}>
          Chegue com 10 minutos de antecedencia para check-in do consultor tecnico.
        </Text>
      </ThemedCard>

      <Text style={styles.sectionHeader}>DETALHES</Text>
      <ThemedCard style={styles.card}>
        {service.details.map((detail) => (
          <View key={detail.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quilometragem</Text>
          <Text style={styles.detailValue}>{service.mileage.toLocaleString("pt-BR")} km</Text>
        </View>
        {service.notes ? <Text style={styles.notes}>{service.notes}</Text> : null}
      </ThemedCard>

      <ThemedButton
        title="Ver meus servicos"
        icon="calendar-wrench"
        onPress={() => router.replace("/(tabs)/services")}
        style={styles.cta}
      />
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
    textAlign: "center",
  },
  backButton: {
    marginTop: spacing.lg,
    minWidth: 150,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  serviceType: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  vehicle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  date: {
    ...typography.header,
    color: colors.warning,
    marginTop: spacing.md,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.xl,
  },
  cardTitle: {
    ...typography.header,
    color: colors.textPrimary,
  },
  cardText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  notes: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  cta: {
    minHeight: 52,
  },
});
