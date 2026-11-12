/**
 * Non-diagnostic informational reference ranges for blood glucose tracking.
 * These thresholds are configurable references for patient awareness and self-monitoring.
 * They do not constitute medical diagnosis or clinical treatment recommendations.
 */
export const GLUCOSE_THRESHOLDS = {
  low: 70,       // mg/dl reference boundary
  elevated: 140,  // mg/dl reference boundary
};

/**
 * Returns informational indicator for a glucose value.
 * Explicitly framed as non-diagnostic informational categorization.
 */
export function getGlucoseIndicator(value) {
  const num = Number(value);
  if (isNaN(num)) return null;

  if (num < GLUCOSE_THRESHOLDS.low) {
    return {
      label: `Below ${GLUCOSE_THRESHOLDS.low}`,
      category: "low",
      badgeClass: "bg-[#F15B52]/10 text-[#F15B52] border border-[#F15B52]/20",
      description: `Informational reference: below ${GLUCOSE_THRESHOLDS.low} mg/dl reference line`,
    };
  }

  if (num > GLUCOSE_THRESHOLDS.elevated) {
    return {
      label: `Above ${GLUCOSE_THRESHOLDS.elevated}`,
      category: "elevated",
      badgeClass: "bg-[#FF963D]/10 text-[#FF963D] border border-[#FF963D]/20",
      description: `Informational reference: above ${GLUCOSE_THRESHOLDS.elevated} mg/dl reference line`,
    };
  }

  return {
    label: `${GLUCOSE_THRESHOLDS.low}–${GLUCOSE_THRESHOLDS.elevated}`,
    category: "standard",
    badgeClass: "bg-[#C5F53C]/30 text-[#101310] border border-[#C5F53C]/40",
    description: `Informational reference: within ${GLUCOSE_THRESHOLDS.low}–${GLUCOSE_THRESHOLDS.elevated} mg/dl reference range`,
  };
}
