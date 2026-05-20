import { Dimensions, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { colors } from "../../constants/theme";
import { VehicleSystemScores } from "../../types";

interface MaintenanceChartProps {
  systems: VehicleSystemScores;
}

export default function MaintenanceChart({ systems }: MaintenanceChartProps) {
  const width = Math.min(Dimensions.get("window").width - 48, 520);

  return (
    <View style={styles.container}>
      <BarChart
        width={width}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          color: (opacity = 1) => `rgba(27, 92, 255, ${opacity})`,
          labelColor: () => colors.textSecondary,
          barPercentage: 0.62,
          decimalPlaces: 0,
          propsForBackgroundLines: {
            stroke: colors.border,
          },
        }}
        data={{
          labels: ["Motor", "Freios", "Pneus", "Susp.", "Ar", "Fluidos"],
          datasets: [
            {
              data: [
                systems.motor,
                systems.freios,
                systems.pneus,
                systems.suspensao,
                systems.arCondicionado,
                systems.fluidos,
              ],
            },
          ],
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    overflow: "hidden",
  },
  chart: {
    borderRadius: 12,
  },
});
