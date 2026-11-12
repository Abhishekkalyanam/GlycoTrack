const VALID_TIME_SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner",
];

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateString(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    const year = dateInput.getUTCFullYear();
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const str = String(dateInput).trim();
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // If ISO string like 2026-11-12T...
  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return null;
}

function parseDateToUtcMidnight(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function getDuplicateSlotMessage(slot) {
  const article = slot && slot.toLowerCase().startsWith("after") ? "an" : "a";
  return `You already have ${article} ${slot} reading for this date.`;
}

function validateReadingInput(data) {
  const { date, timeSlot, value } = data;

  // 1. Glucose value is required
  if (value === undefined || value === null || value === "") {
    return { isValid: false, message: "Please enter a glucose value." };
  }

  // 2. Value must be a whole number between 40 and 600
  const numValue = Number(value);
  if (
    typeof value === "boolean" ||
    isNaN(numValue) ||
    !Number.isInteger(numValue) ||
    numValue < 40 ||
    numValue > 600
  ) {
    return { isValid: false, message: "Value must be between 40 and 600 mg/dl." };
  }

  // Time slot validation
  if (!timeSlot || !VALID_TIME_SLOTS.includes(timeSlot)) {
    return {
      isValid: false,
      message: `Invalid time slot. Permitted slots: ${VALID_TIME_SLOTS.join(", ")}`,
    };
  }

  // Date validation
  if (!date) {
    return { isValid: false, message: "Date is required." };
  }

  const normalizedDate = normalizeDateString(date);
  if (!normalizedDate) {
    return { isValid: false, message: "Invalid date format. Expected YYYY-MM-DD." };
  }

  // 5. Future dates are not allowed
  const todayStr = getTodayString();
  if (normalizedDate > todayStr) {
    return { isValid: false, message: "Date cannot be in the future." };
  }

  return {
    isValid: true,
    data: {
      date: normalizedDate,
      dateUtc: parseDateToUtcMidnight(normalizedDate),
      timeSlot,
      value: numValue,
    },
  };
}

module.exports = {
  VALID_TIME_SLOTS,
  getTodayString,
  normalizeDateString,
  parseDateToUtcMidnight,
  getDuplicateSlotMessage,
  validateReadingInput,
};

