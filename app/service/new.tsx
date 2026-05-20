import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addDays, format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Searchbar, Snackbar, TextInput } from "react-native-paper";
import ScreenContainer from "../../components/ui/ScreenContainer";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedCard from "../../components/ui/ThemedCard";
import { serviceTypeOptions, timeSlots } from "../../constants/mockData";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { useNotifications } from "../../hooks/useNotifications";
import { useDealerships, useServices } from "../../hooks/useServices";
import { useVehicles } from "../../hooks/useVehicles";
import { lookupCep } from "../../services/api";
import { Dealership, NewServiceInput } from "../../types";

interface DateOption {
  iso: string;
  label: string;
  weekday: string;
  disabled: boolean;
}

const buildDateOptions = (): DateOption[] => {
  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(new Date(), index + 1);
    return {
      iso: format(date, "yyyy-MM-dd"),
      label: format(date, "dd MMM", { locale: ptBR }),
      weekday: format(date, "EEE", { locale: ptBR }),
      disabled: isWeekend(date),
    };
  });
};

export default function NewServiceScreen() {
  const [step, setStep] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [mileage, setMileage] = useState("");
  const [dealershipSearch, setDealershipSearch] = useState("");
  const [selectedDealershipId, setSelectedDealershipId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [cepHint, setCepHint] = useState<string | null>(null);
  const { vehicles } = useVehicles();
  const { addService } = useServices();
  const { scheduleServiceReminder } = useNotifications();
  const { data: dealerships = [], isLoading: dealershipsLoading } = useDealerships();

  const dateOptions = useMemo(() => buildDateOptions(), []);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const selectedDealership = dealerships.find((dealership) => dealership.id === selectedDealershipId);

  useEffect(() => {
    if (!selectedVehicleId && vehicles[0]) {
      setSelectedVehicleId(vehicles[0].id);
      setMileage(String(vehicles[0].mileage));
    }
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!selectedDate) {
      const firstAvailable = dateOptions.find((option) => !option.disabled);
      setSelectedDate(firstAvailable?.iso ?? "");
    }
  }, [dateOptions, selectedDate]);

  const filteredDealerships = useMemo(() => {
    const term = dealershipSearch.trim().toLocaleLowerCase("pt-BR");
    if (!term) return dealerships;
    return dealerships.filter((dealership) => {
      const target = `${dealership.name} ${dealership.address} ${dealership.neighborhood}`.toLocaleLowerCase("pt-BR");
      return target.includes(term);
    });
  }, [dealershipSearch, dealerships]);

  const toggleServiceType = (type: string) => {
    setServiceTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  const selectDealership = async (dealership: Dealership) => {
    setSelectedDealershipId(dealership.id);
    setCepHint(null);
    try {
      const address = await lookupCep(dealership.cep);
      if (address) {
        setCepHint(`${address.logradouro}, ${address.bairro} - ${address.localidade}/${address.uf}`);
      }
    } catch {
      setCepHint("Endereco validado pela base local da concessionaria.");
    }
  };

  const canContinueStepOne = selectedVehicleId && serviceTypes.length > 0 && Number(mileage) > 0;
  const canContinueStepTwo = selectedDealershipId && selectedDate && selectedTime;

  const confirmBooking = async () => {
    if (!selectedVehicle || !selectedDealership || !canContinueStepOne || !canContinueStepTwo) return;

    setSaving(true);
    try {
      const input: NewServiceInput = {
        vehicleId: selectedVehicle.id,
        serviceTypes,
        mileage: Number(mileage),
        dealershipId: selectedDealership.id,
        date: selectedDate,
        time: selectedTime,
        notes,
      };
      const service = await addService(input);
      await scheduleServiceReminder(service);
      setSnackbarVisible(true);
      setTimeout(() => router.replace("/(tabs)/services"), 850);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.topBar}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={34}
          color={colors.textPrimary}
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Novo agendamento</Text>
        <Text style={styles.stepText}>{step}/3</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      {step === 1 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.sectionHeader}>VEICULO</Text>
          {vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              onPress={() => {
                setSelectedVehicleId(vehicle.id);
                setMileage(String(vehicle.mileage));
              }}
              style={[
                styles.selectionCard,
                selectedVehicleId === vehicle.id && styles.selectionCardActive,
              ]}
            >
              <View>
                <Text style={styles.selectionTitle}>{vehicle.model}</Text>
                <Text style={styles.selectionMeta}>
                  {vehicle.plate} - {vehicle.mileage.toLocaleString("pt-BR")} km
                </Text>
              </View>
              <MaterialCommunityIcons
                name={selectedVehicleId === vehicle.id ? "check-circle" : "circle-outline"}
                size={24}
                color={selectedVehicleId === vehicle.id ? colors.success : colors.textMuted}
              />
            </Pressable>
          ))}

          <Text style={styles.sectionHeader}>TIPO DE SERVICO</Text>
          <View style={styles.optionGrid}>
            {serviceTypeOptions.map((type) => {
              const active = serviceTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  onPress={() => toggleServiceType(type)}
                  style={[styles.serviceOption, active && styles.serviceOptionActive]}
                >
                  <MaterialCommunityIcons
                    name={active ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                    size={20}
                    color={active ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            label="Quilometragem atual"
            value={mileage}
            onChangeText={(value) => setMileage(value.replace(/\D/g, ""))}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.sectionHeader}>CONCESSIONARIA</Text>
          <Searchbar
            placeholder="Buscar por nome ou bairro"
            value={dealershipSearch}
            onChangeText={setDealershipSearch}
            style={styles.search}
            inputStyle={styles.searchInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealerRow}>
            {(dealershipsLoading ? [] : filteredDealerships).map((dealership) => {
              const active = selectedDealershipId === dealership.id;
              return (
                <ThemedCard
                  key={dealership.id}
                  onPress={() => void selectDealership(dealership)}
                  style={[styles.dealershipCard, active && styles.activeBorder]}
                >
                  <Text style={styles.dealershipName}>{dealership.name}</Text>
                  <Text style={styles.dealershipAddress}>{dealership.address}</Text>
                  <Text style={styles.dealershipMeta}>
                    {dealership.distanceKm.toFixed(1)} km - {dealership.rating.toFixed(1)} estrelas
                  </Text>
                  <StatusBadge label={`${dealership.availableSlots} horarios`} tone="info" />
                </ThemedCard>
              );
            })}
          </ScrollView>
          {cepHint ? <Text style={styles.cepHint}>{cepHint}</Text> : null}

          <Text style={styles.sectionHeader}>DATA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {dateOptions.map((option) => {
              const active = selectedDate === option.iso;
              return (
                <Pressable
                  key={option.iso}
                  disabled={option.disabled}
                  onPress={() => setSelectedDate(option.iso)}
                  style={[
                    styles.dateChip,
                    active && styles.dateChipActive,
                    option.disabled && styles.dateChipDisabled,
                  ]}
                >
                  <Text style={[styles.dateWeekday, active && styles.dateTextActive]}>
                    {option.weekday}
                  </Text>
                  <Text style={[styles.dateLabel, active && styles.dateTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionHeader}>HORARIO</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => {
              const active = selectedTime === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  style={[styles.timeChip, active && styles.timeChipActive]}
                >
                  <Text style={[styles.timeText, active && styles.dateTextActive]}>{slot}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.sectionHeader}>CONFIRMAR</Text>
          <ThemedCard style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{selectedVehicle?.model}</Text>
            <Text style={styles.summaryLine}>{serviceTypes.join(", ")}</Text>
            <Text style={styles.summaryLine}>
              {selectedDate ? format(new Date(`${selectedDate}T12:00:00`), "dd MMM yyyy", { locale: ptBR }) : ""} -{" "}
              {selectedTime}
            </Text>
            <Text style={styles.summaryLine}>{selectedDealership?.name}</Text>
            <Text style={styles.summaryLine}>{Number(mileage).toLocaleString("pt-BR")} km</Text>
          </ThemedCard>
          <TextInput
            label="Observacoes especiais"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={5}
            style={styles.notesInput}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        {step > 1 ? (
          <ThemedButton
            title="Voltar"
            variant="outline"
            onPress={() => setStep((current) => current - 1)}
            style={styles.actionButton}
          />
        ) : null}
        {step < 3 ? (
          <ThemedButton
            title="Continuar"
            icon="arrow-right"
            disabled={step === 1 ? !canContinueStepOne : !canContinueStepTwo}
            onPress={() => setStep((current) => current + 1)}
            style={styles.actionButton}
          />
        ) : (
          <ThemedButton
            title="Confirmar Agendamento"
            icon="check"
            loading={saving}
            disabled={saving}
            onPress={confirmBooking}
            style={styles.actionButton}
          />
        )}
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={900}>
        Agendamento confirmado. Lembrete criado.
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.header,
    color: colors.textPrimary,
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 34,
    textAlign: "right",
  },
  progressTrack: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.round,
    height: 8,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.round,
    height: "100%",
  },
  stepBlock: {
    gap: spacing.md,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  selectionCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  selectionCardActive: {
    borderColor: colors.primaryLight,
  },
  selectionTitle: {
    ...typography.header,
    color: colors.textPrimary,
  },
  selectionMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  serviceOption: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  serviceOptionActive: {
    backgroundColor: "rgba(0,200,83,0.12)",
    borderColor: colors.success,
  },
  optionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  dealerRow: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dealershipCard: {
    width: 260,
  },
  activeBorder: {
    borderColor: colors.primaryLight,
  },
  dealershipName: {
    ...typography.header,
    color: colors.textPrimary,
  },
  dealershipAddress: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.sm,
  },
  dealershipMeta: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.md,
  },
  cepHint: {
    ...typography.caption,
    color: colors.success,
  },
  dateRow: {
    gap: spacing.sm,
  },
  dateChip: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 78,
    padding: spacing.md,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  dateChipDisabled: {
    opacity: 0.35,
  },
  dateWeekday: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  dateLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  dateTextActive: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 84,
    padding: spacing.md,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  timeText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.header,
    color: colors.textPrimary,
  },
  summaryLine: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
  },
});
