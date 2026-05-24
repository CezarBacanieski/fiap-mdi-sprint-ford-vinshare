import { Component, ErrorInfo, PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../constants/theme";
import { securityLog } from "../../security/logger";

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    securityLog("error", "ui_unhandled_exception", { message: error.message });
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo saiu do planejado.</Text>
          <Text style={styles.body}>
            Feche e abra o Ford+ novamente. Seus dados locais continuam salvos.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    ...typography.header,
    color: colors.textPrimary,
    textAlign: "center",
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
