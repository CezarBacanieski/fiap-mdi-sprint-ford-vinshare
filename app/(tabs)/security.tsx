import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { getSecurityMetrics, SecurityMetricsSnapshot } from "../../security/metrics";

const labels: Record<keyof SecurityMetricsSnapshot["counters"], string> = {
  api_requests_total: "Requisições de API",
  api_errors_total: "Erros de API",
  login_success_total: "Logins concluídos",
  login_failed_total: "Falhas de login",
  rate_limit_blocked_total: "Bloqueios de limite",
  security_events_total: "Eventos de segurança",
  auth_refresh_failed_total: "Falhas de refresh",
};

export default function SecurityDashboardScreen() {
  const [snapshot, setSnapshot] = useState<SecurityMetricsSnapshot>(getSecurityMetrics());
  const refresh = useCallback(() => setSnapshot(getSecurityMetrics()), []);

  useEffect(() => {
    const timer = setInterval(refresh, 2_000);
    return () => clearInterval(timer);
  }, [refresh]);
  useFocusEffect(refresh);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Monitoramento de segurança</Text>
      <Text style={styles.subtitle}>Contadores da execução atual do aplicativo.</Text>
      <View style={styles.grid}>
        {Object.entries(snapshot.counters).map(([name, value]) => (
          <View key={name} style={styles.card}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{labels[name as keyof typeof labels]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.updated}>Atualizado em {new Date(snapshot.generatedAt).toLocaleTimeString("pt-BR")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, flexGrow: 1, padding: spacing.lg },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, minHeight: 112, padding: spacing.md, width: "48%" },
  value: { color: colors.primaryLight, fontSize: 30, fontWeight: "800" },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  updated: { ...typography.caption, color: colors.textMuted, marginTop: spacing.lg },
});
