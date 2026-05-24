import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Snackbar, TextInput } from "react-native-paper";
import ScreenContainer from "../components/ui/ScreenContainer";
import ThemedButton from "../components/ui/ThemedButton";
import { colors, spacing, typography } from "../constants/theme";
import { AppSecurityError } from "../security/errors";
import { sanitizeText } from "../security/sanitization";
import { useAuth } from "../hooks/useAuth";

export default function SignInScreen() {
  const [email, setEmail] = useState("cliente@fordplus.app");
  const [password, setPassword] = useState("FordPlus#2026!");
  const [submitting, setSubmitting] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const { signInWithPassword } = useAuth();

  const canSubmit = email.trim().length > 5 && password.length > 11;

  const handleSignIn = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await signInWithPassword(sanitizeText(email).toLowerCase(), sanitizeText(password));
      router.replace("/onboarding");
    } catch (error) {
      if (error instanceof AppSecurityError) {
        setSnackMessage(error.publicMessage);
      } else {
        setSnackMessage("Não foi possível autenticar. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-check-outline" size={48} color={colors.primaryLight} />
        </View>
        <Text style={styles.title}>Acesso seguro Ford+</Text>
        <Text style={styles.subtitle}>Entre para continuar com sessão protegida e tokens rotativos.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="E-mail"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          onChangeText={(value) => setEmail(sanitizeText(value))}
          style={styles.input}
        />
        <TextInput
          label="Senha"
          value={password}
          secureTextEntry
          autoCapitalize="none"
          mode="outlined"
          onChangeText={(value) => setPassword(value)}
          style={styles.input}
        />

        <ThemedButton
          title="Entrar com segurança"
          icon="lock-check"
          loading={submitting}
          disabled={!canSubmit || submitting}
          onPress={handleSignIn}
          style={styles.button}
        />
      </View>

      <Snackbar visible={Boolean(snackMessage)} onDismiss={() => setSnackMessage("")} duration={2200}>
        {snackMessage}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    height: 84,
    justifyContent: "center",
    marginBottom: spacing.lg,
    width: 84,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.md,
    minHeight: 52,
  },
});
