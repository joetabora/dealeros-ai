import type {
  RoiCalculatorInput,
  RoiCalculatorOutput,
} from "@/types/closing-kit";

type ImpactLifts = {
  engagementLift: number;
  attendanceLift: number;
  followUpLift: number;
};

const AVG_EVENT_SPEND = 175;
const AVG_LEAD_VALUE = 850;
const AVG_SERVICE_VALUE = 240;

const DEFAULT_LIFTS: ImpactLifts = {
  engagementLift: 35,
  attendanceLift: 25,
  followUpLift: 38,
};

export function calculateRoi(
  input: RoiCalculatorInput,
  lifts: ImpactLifts = DEFAULT_LIFTS,
): RoiCalculatorOutput {
  const footTraffic = Math.max(0, input.monthlyFootTraffic);
  const eventAttendance = Math.max(0, input.eventAttendance);
  const conversionRate = Math.min(100, Math.max(0, input.leadConversionRate)) / 100;
  const serviceVolume = Math.max(0, input.serviceVolume);

  const baseLeads = Math.round(footTraffic * conversionRate);

  const eventAttendanceIncreasePct = lifts.attendanceLift;
  const eventAttendanceIncrease = Math.round(
    eventAttendance * (eventAttendanceIncreasePct / 100),
  );

  const leadsIncreasePct = Math.round(
    lifts.engagementLift * 0.45 + lifts.followUpLift * 0.55,
  );
  const leadsIncrease = Math.max(1, Math.round(baseLeads * (leadsIncreasePct / 100)));

  const serviceBookingsIncreasePct = Math.round(
    lifts.followUpLift * 0.7 + lifts.engagementLift * 0.3,
  );
  const serviceBookingsIncrease = Math.max(
    1,
    Math.round(serviceVolume * (serviceBookingsIncreasePct / 100)),
  );

  const eventRevenue = eventAttendanceIncrease * AVG_EVENT_SPEND;
  const leadRevenue = leadsIncrease * AVG_LEAD_VALUE;
  const serviceRevenue = serviceBookingsIncrease * AVG_SERVICE_VALUE;

  const totalMonthly = eventRevenue + leadRevenue + serviceRevenue;
  const revenueImpactLow = Math.round(totalMonthly * 0.85);
  const revenueImpactHigh = Math.round(totalMonthly * 1.15);

  return {
    eventAttendanceIncrease,
    eventAttendanceIncreasePct,
    leadsIncrease,
    leadsIncreasePct,
    serviceBookingsIncrease,
    serviceBookingsIncreasePct,
    revenueImpactLow,
    revenueImpactHigh,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
