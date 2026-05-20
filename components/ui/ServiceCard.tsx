import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../constants/theme";
import { ServiceRecord } from "../../types";
import StatusBadge from "./StatusBadge";
import ThemedCard from "./ThemedCard";

interface ServiceCardProps {
  service: ServiceRecord;
  expandable?: boolean;
  onPress?: () => void;
}

export default function ServiceCard({ service, expandable, onPress }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const handlePress = () => {
    if (expandable) {
      setExpanded((value) => !value);
    }
    onPress?.();
  };

  return (
    <ThemedCard onPress={handlePress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="wrench-clock" size={24} color={colors.primaryLight} />
        </View>
        <View style={styles.main}>
          <Text style={styles.type}>{service.type}</Text>
          <Text style={styles.dealer}>{service.dealershipName}</Text>
        </View>
        <StatusBadge label={service.status} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {format(parseISO(service.date), "dd MMM yyyy", { locale: ptBR })}
          {service.time ? ` - ${service.time}` : ""}
        </Text>
        <Text style={styles.meta}>{service.mileage.toLocaleString("pt-BR")} km</Text>
        {service.cost ? (
          <Text style={styles.cost}>
            {service.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        ) : null}
      </View>
      {expanded ? (
        <View style={styles.details}>
          {service.details.map((detail) => (
            <View key={`${service.id}-${detail.label}`} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
          {service.notes ? <Text style={styles.notes}>{service.notes}</Text> : null}
        </View>
      ) : null}
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(27,92,255,0.16)",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  main: {
    flex: 1,
  },
  type: {
    ...typography.header,
    color: colors.textPrimary,
  },
  dealer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cost: {
    ...typography.caption,
    color: colors.success,
  },
  details: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
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
    ...typography.caption,
    color: colors.textSecondary,
  },
});
