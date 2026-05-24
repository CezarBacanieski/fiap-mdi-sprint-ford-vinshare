import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Divider, Snackbar, Switch, TextInput } from "react-native-paper";
import ScreenContainer from "../../components/ui/ScreenContainer";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedCard from "../../components/ui/ThemedCard";
import { groupMembers } from "../../constants/mockData";
import { colors, gradients, radius, spacing, typography } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useRewards } from "../../hooks/useRewards";
import { useVehicles } from "../../hooks/useVehicles";
import { setStringItem, getStringItem, storageKeys } from "../../services/storage";
import { AppSecurityError } from "../../security/errors";
import { sanitizeText } from "../../security/sanitization";
import { User } from "../../types";

export default function ProfileScreen() {
  const { user, currentTier, updateUser, isLoading } = useRewards();
  const { vehicles } = useVehicles();
  const { signOut, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draftUser, setDraftUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reviewRemindersEnabled, setReviewRemindersEnabled] = useState(true);
  const [snackMessage, setSnackMessage] = useState("");

  useEffect(() => {
    if (user) setDraftUser(user);
  }, [user]);

  useEffect(() => {
    const loadSettings = async () => {
      const [notifications, reminders] = await Promise.all([
        getStringItem(storageKeys.notificationsEnabled),
        getStringItem(storageKeys.reviewRemindersEnabled),
      ]);
      setNotificationsEnabled(notifications !== "false");
      setReviewRemindersEnabled(reminders !== "false");
    };
    void loadSettings();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await setStringItem(storageKeys.notificationsEnabled, String(value));
  };

  const toggleReminders = async (value: boolean) => {
    setReviewRemindersEnabled(value);
    await setStringItem(storageKeys.reviewRemindersEnabled, String(value));
  };

  const saveProfile = async () => {
    if (!draftUser) return;
    try {
      await updateUser(draftUser);
      setEditing(false);
      setSnackMessage("Perfil atualizado com segurança.");
    } catch (error) {
      if (error instanceof AppSecurityError) {
        setSnackMessage(error.publicMessage);
      } else {
        setSnackMessage("Não foi possível atualizar o perfil.");
      }
    }
  };

  const resetSession = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  if (isLoading || !user || !draftUser) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Carregando perfil...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ThemedCard gradient={gradients.blueCard} style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <StatusBadge label={currentTier.tier} tone="premium" />
              <Text style={styles.memberSince}>Desde 2022</Text>
            </View>
          </View>
        </View>
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <View style={styles.sectionTop}>
          <Text style={styles.sectionHeader}>DADOS PESSOAIS</Text>
          <ThemedButton
            title={editing ? "Salvar" : "Editar"}
            icon={editing ? "check" : "pencil"}
            compact
            onPress={editing ? saveProfile : () => setEditing(true)}
          />
        </View>
        {editing ? (
          <View style={styles.editBlock}>
            <TextInput
              label="Nome"
              value={draftUser.name}
              mode="outlined"
              onChangeText={(name) =>
                setDraftUser((current) => (current ? { ...current, name: sanitizeText(name) } : current))
              }
              style={styles.input}
            />
            <TextInput
              label="E-mail"
              value={draftUser.email}
              mode="outlined"
              keyboardType="email-address"
              onChangeText={(email) =>
                setDraftUser((current) => (current ? { ...current, email: sanitizeText(email) } : current))
              }
              style={styles.input}
            />
            <TextInput
              label="Telefone"
              value={draftUser.phone}
              mode="outlined"
              keyboardType="phone-pad"
              onChangeText={(phone) =>
                setDraftUser((current) => (current ? { ...current, phone: sanitizeText(phone) } : current))
              }
              style={styles.input}
            />
          </View>
        ) : (
          <View style={styles.profileRows}>
            <InfoRow label="CPF" value={user.cpf} />
            <InfoRow label="Telefone" value={user.phone} />
            <InfoRow label="Pontos" value={`${user.points.toLocaleString("pt-BR")} pts`} />
            <InfoRow label="Perfil de acesso" value={role ?? "user"} />
          </View>
        )}
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.sectionHeader}>MEUS VEICULOS</Text>
            <Text style={styles.summaryText}>Veiculos cadastrados na garagem Ford+</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{vehicles.length}</Text>
          </View>
        </View>
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <Text style={styles.sectionHeader}>CONFIGURACOES</Text>
        <SettingRow
          icon="bell-outline"
          label="Notificacoes"
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
        <Divider style={styles.divider} />
        <SettingRow
          icon="calendar-alert"
          label="Lembrete de revisao"
          value={reviewRemindersEnabled}
          onValueChange={toggleReminders}
        />
        <Divider style={styles.divider} />
        <SettingRow icon="theme-light-dark" label="Tema escuro" value disabled />
        <Divider style={styles.divider} />
        <View style={styles.settingLine}>
          <MaterialCommunityIcons name="translate" size={22} color={colors.primaryLight} />
          <Text style={styles.settingLabel}>Idioma</Text>
          <Text style={styles.settingValue}>Portugues (BR)</Text>
        </View>
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <Text style={styles.sectionHeader}>SOBRE O APP</Text>
        <InfoRow label="Versao" value={Constants.expoConfig?.version ?? "1.0.0"} />
        <InfoRow label="Projeto" value="Ford FIAP Sprint - Challenge 02 VIN Share" />
        <Text style={styles.membersTitle}>Integrantes</Text>
        {groupMembers.map((member) => (
          <Text key={member} style={styles.member}>
            {member}
          </Text>
        ))}
      </ThemedCard>

      <ThemedButton
        title="Sair"
        icon="logout"
        variant="secondary"
        onPress={resetSession}
        style={styles.logout}
      />

      <Snackbar visible={Boolean(snackMessage)} onDismiss={() => setSnackMessage("")} duration={2200}>
        {snackMessage}
      </Snackbar>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onValueChange,
  disabled,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <View style={styles.settingLine}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.primaryLight} />
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} color={colors.primaryLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.header,
    color: colors.textPrimary,
  },
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.round,
    borderWidth: 1,
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.xl,
  },
  sectionTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
  },
  editBlock: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
  },
  profileRows: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  summaryText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  countText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  settingLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 48,
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  settingValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    backgroundColor: colors.border,
  },
  membersTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  member: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  logout: {
    marginBottom: spacing.xl,
    minHeight: 52,
  },
});
