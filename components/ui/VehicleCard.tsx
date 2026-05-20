import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { colors, gradients, spacing, typography } from "../../constants/theme";
import { Vehicle } from "../../types";
import ProgressRing from "./ProgressRing";
import StatusBadge from "./StatusBadge";
import ThemedCard from "./ThemedCard";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onDelete?: () => void;
}

function DeleteAction({ onDelete }: { onDelete: () => void }) {
  return (
    <View style={styles.deleteAction}>
      <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.white} onPress={onDelete} />
      <Text style={styles.deleteLabel}>Excluir</Text>
    </View>
  );
}

export default function VehicleCard({ vehicle, onPress, onDelete }: VehicleCardProps) {
  const card = (
    <ThemedCard onPress={onPress} gradient={gradients.premium} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.vehicleImage}>
          <Text style={styles.fordText}>FORD</Text>
          <MaterialCommunityIcons name="car-sports" size={42} color={colors.white} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.model}>{vehicle.model}</Text>
              <Text style={styles.version}>
                {vehicle.year} - {vehicle.version}
              </Text>
            </View>
            <ProgressRing score={vehicle.healthScore} size={62} strokeWidth={7} />
          </View>
          <View style={styles.metaRow}>
            <StatusBadge label={vehicle.fuelType} tone="info" />
            <Text style={styles.plate}>{vehicle.plate}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.caption}>{vehicle.mileage.toLocaleString("pt-BR")} km</Text>
            <Text style={styles.caption}>
              Ultimo: {format(parseISO(vehicle.lastService), "dd MMM yyyy", { locale: ptBR })}
            </Text>
          </View>
        </View>
      </View>
    </ThemedCard>
  );

  if (!onDelete) return card;

  return (
    <Swipeable renderRightActions={() => <DeleteAction onDelete={onDelete} />}>{card}</Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  vehicleImage: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 104,
    justifyContent: "center",
    overflow: "hidden",
    width: 106,
  },
  fordText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    position: "absolute",
    top: 14,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  model: {
    ...typography.header,
    color: colors.textPrimary,
  },
  version: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  plate: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deleteAction: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: spacing.lg,
    marginLeft: spacing.sm,
    width: 82,
  },
  deleteLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
});
