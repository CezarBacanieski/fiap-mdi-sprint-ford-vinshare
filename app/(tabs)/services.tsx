import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FAB, SegmentedButtons } from "react-native-paper";
import ScreenContainer from "../../components/ui/ScreenContainer";
import ServiceCard from "../../components/ui/ServiceCard";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ThemedButton from "../../components/ui/ThemedButton";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { useServices } from "../../hooks/useServices";

type ServiceTab = "upcoming" | "history";

export default function ServicesScreen() {
  const {
    upcomingServices,
    historyServices,
    isLoading,
    errorMessage,
    reloadServices,
  } = useServices();
  const [activeTab, setActiveTab] = useState<ServiceTab>("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reloadServices();
    }, [reloadServices]),
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await reloadServices();
    } finally {
      setRefreshing(false);
    }
  };

  const data = activeTab === "upcoming" ? upcomingServices : historyServices;

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Servicos</Text>
          <Text style={styles.subtitle}>Agendamentos e historico oficial</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="wrench-clock" size={28} color={colors.primaryLight} />
        </View>
      </View>

      <SegmentedButtons
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ServiceTab)}
        style={styles.segmented}
        buttons={[
          { value: "upcoming", label: "Proximos", icon: "calendar-clock" },
          { value: "history", label: "Historico", icon: "history" },
        ]}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonBox height={116} />
          <SkeletonBox height={116} />
          <SkeletonBox height={116} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              expandable={activeTab === "history"}
              onPress={activeTab === "upcoming" ? () => router.push(`/service/${item.id}`) : undefined}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="calendar-plus" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nada por aqui</Text>
              <Text style={styles.emptyText}>
                {activeTab === "upcoming"
                  ? "Agende seu proximo servico em uma concessionaria Ford."
                  : "Os servicos concluidos aparecem aqui."}
              </Text>
              {activeTab === "upcoming" ? (
                <ThemedButton
                  title="Agendar servico"
                  icon="calendar-plus"
                  onPress={() => router.push("/service/new")}
                  style={styles.emptyButton}
                />
              ) : null}
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        color={colors.white}
        style={styles.fab}
        onPress={() => router.push("/service/new")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.round,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  segmented: {
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: 120,
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
  fab: {
    backgroundColor: colors.primary,
    bottom: 92,
    position: "absolute",
    right: spacing.xl,
  },
});
