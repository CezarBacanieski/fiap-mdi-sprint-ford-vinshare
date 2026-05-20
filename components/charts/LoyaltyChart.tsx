import { Dimensions, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../../constants/theme";
import { RewardTransaction } from "../../types";

interface LoyaltyChartProps {
  transactions: RewardTransaction[];
}

export default function LoyaltyChart({ transactions }: LoyaltyChartProps) {
  const width = Math.min(Dimensions.get("window").width - 48, 520);
  const ordered = [...transactions].reverse().slice(-6);
  let runningTotal = 0;
  const data = ordered.map((transaction) => {
    runningTotal += transaction.points;
    return Math.max(runningTotal, 0);
  });

  return (
    <View style={styles.container}>
      <LineChart
        width={width}
        height={180}
        bezier
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
          labelColor: () => colors.textSecondary,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.success,
          },
        }}
        data={{
          labels: ordered.map((transaction) => transaction.date.slice(5).replace("-", "/")),
          datasets: [{ data: data.length > 0 ? data : [0] }],
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
