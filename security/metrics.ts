export type SecurityMetricName =
  | "api_requests_total"
  | "api_errors_total"
  | "login_success_total"
  | "login_failed_total"
  | "rate_limit_blocked_total"
  | "security_events_total"
  | "auth_refresh_failed_total";

export interface SecurityMetricsSnapshot {
  generatedAt: string;
  counters: Record<SecurityMetricName, number>;
}

const metricNames: SecurityMetricName[] = [
  "api_requests_total",
  "api_errors_total",
  "login_success_total",
  "login_failed_total",
  "rate_limit_blocked_total",
  "security_events_total",
  "auth_refresh_failed_total",
];

const counters: Record<SecurityMetricName, number> = Object.fromEntries(
  metricNames.map((name) => [name, 0]),
) as Record<SecurityMetricName, number>;

export const incrementSecurityMetric = (name: SecurityMetricName): void => {
  counters[name] += 1;
};

export const getSecurityMetrics = (): SecurityMetricsSnapshot => ({
  generatedAt: new Date().toISOString(),
  counters: { ...counters },
});
