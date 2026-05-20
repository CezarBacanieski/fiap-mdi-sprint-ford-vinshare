import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { FAB, HelperText, Menu, Modal, Portal, TextInput } from "react-native-paper";
import ScreenContainer from "../../components/ui/ScreenContainer";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ThemedButton from "../../components/ui/ThemedButton";
import VehicleCard from "../../components/ui/VehicleCard";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { useFordModels, useVehicles } from "../../hooks/useVehicles";
import { FuelType, NewVehicleInput } from "../../types";

const fuelTypes: FuelType[] = ["Flex", "Gasolina", "Diesel", "Hibrido", "Eletrico"];
const years = Array.from({ length: 12 }, (_, index) => 2026 - index);

const initialForm: NewVehicleInput = {
  brand: "Ford",
  model: "",
  version: "",
  year: 2024,
  plate: "",
  mileage: 0,
  fuelType: "Flex",
  color: "",
};

export default function VehiclesScreen() {
  const { vehicles, isLoading, errorMessage, addVehicle, deleteVehicle } = useVehicles();
  const [modalVisible, setModalVisible] = useState(false);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [form, setForm] = useState<NewVehicleInput>(initialForm);
  const [saving, setSaving] = useState(false);
  const { data: fipeModels = [], isFetching } = useFordModels(form.model);

  const formValid = useMemo(() => {
    return form.model.trim().length > 1 && form.plate.trim().length >= 7 && form.mileage >= 0;
  }, [form]);

  const closeModal = () => {
    setModalVisible(false);
    setModelMenuVisible(false);
    setForm(initialForm);
  };

  const saveVehicle = async () => {
    if (!formValid) return;
    setSaving(true);
    try {
      await addVehicle(form);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Veiculos</Text>
          <Text style={styles.subtitle}>{vehicles.length} conectados ao Ford+</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="car-connected" size={28} color={colors.primaryLight} />
        </View>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonBox height={140} />
          <SkeletonBox height={140} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => router.push(`/vehicle/${item.id}`)}
              onDelete={() => deleteVehicle(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="garage-open" size={42} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum veiculo cadastrado</Text>
              <Text style={styles.emptyText}>Adicione seu Ford para receber alertas e beneficios.</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        color={colors.white}
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Adicionar veiculo</Text>
          <TextInput
            label="Marca"
            value={form.brand}
            disabled
            mode="outlined"
            style={styles.input}
          />

          <Menu
            visible={modelMenuVisible && fipeModels.length > 0}
            onDismiss={() => setModelMenuVisible(false)}
            anchor={
              <TextInput
                label="Modelo Ford"
                value={form.model}
                mode="outlined"
                right={<TextInput.Icon icon={isFetching ? "loading" : "chevron-down"} />}
                onFocus={() => setModelMenuVisible(true)}
                onChangeText={(model) => {
                  setForm((current) => ({ ...current, model }));
                  setModelMenuVisible(true);
                }}
                style={styles.input}
              />
            }
          >
            {fipeModels.map((model) => (
              <Menu.Item
                key={model.codigo}
                title={model.nome}
                onPress={() => {
                  setForm((current) => ({ ...current, model: model.nome }));
                  setModelMenuVisible(false);
                }}
              />
            ))}
          </Menu>
          <HelperText type="info" visible={form.model.length > 1}>
            Busca FIPE: Ford codigo 26.
          </HelperText>

          <TextInput
            label="Versao"
            value={form.version}
            mode="outlined"
            onChangeText={(version) => setForm((current) => ({ ...current, version }))}
            style={styles.input}
          />

          <View style={styles.chipWrap}>
            {years.map((year) => (
              <Pressable
                key={year}
                onPress={() => setForm((current) => ({ ...current, year }))}
                style={[styles.choiceChip, form.year === year && styles.choiceChipActive]}
              >
                <Text style={[styles.choiceText, form.year === year && styles.choiceTextActive]}>
                  {year}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.rowInputs}>
            <TextInput
              label="Placa"
              value={form.plate}
              mode="outlined"
              autoCapitalize="characters"
              onChangeText={(plate) => setForm((current) => ({ ...current, plate }))}
              style={styles.halfInput}
            />
            <TextInput
              label="Km"
              value={String(form.mileage)}
              mode="outlined"
              keyboardType="number-pad"
              onChangeText={(mileage) =>
                setForm((current) => ({ ...current, mileage: Number(mileage.replace(/\D/g, "")) }))
              }
              style={styles.halfInput}
            />
          </View>

          <TextInput
            label="Cor"
            value={form.color}
            mode="outlined"
            onChangeText={(color) => setForm((current) => ({ ...current, color }))}
            style={styles.input}
          />

          <View style={styles.chipWrap}>
            {fuelTypes.map((fuelType) => (
              <Pressable
                key={fuelType}
                onPress={() => setForm((current) => ({ ...current, fuelType }))}
                style={[styles.choiceChip, form.fuelType === fuelType && styles.choiceChipActive]}
              >
                <Text style={[styles.choiceText, form.fuelType === fuelType && styles.choiceTextActive]}>
                  {fuelType}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.modalActions}>
            <ThemedButton title="Cancelar" variant="outline" onPress={closeModal} style={styles.actionButton} />
            <ThemedButton
              title="Salvar"
              icon="check"
              loading={saving}
              disabled={!formValid}
              onPress={saveVehicle}
              style={styles.actionButton}
            />
          </View>
        </Modal>
      </Portal>
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
    marginBottom: spacing.xl,
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
  error: {
    ...typography.body,
    color: colors.accent,
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
  fab: {
    backgroundColor: colors.primary,
    bottom: 92,
    position: "absolute",
    right: spacing.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    margin: spacing.lg,
    maxHeight: "92%",
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.header,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  rowInputs: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    backgroundColor: colors.surface,
    flex: 1,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceChip: {
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  choiceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  choiceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  choiceTextActive: {
    color: colors.white,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
