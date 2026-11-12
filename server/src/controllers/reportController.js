const prisma = require("../config/prisma");
const {
  getTodayString,
  normalizeDateString,
  parseDateToUtcMidnight,
} = require("../utils/validators");
const { formatReading } = require("./readingController");

function calculateStats(readings) {
  if (!readings || readings.length === 0) {
    return {
      totalReadings: 0,
      highest: null,
      lowest: null,
      average: null,
    };
  }

  const values = readings.map((r) => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = Number((sum / values.length).toFixed(1));

  return {
    totalReadings: readings.length,
    highest,
    lowest,
    average,
  };
}

// A. Daily Report
async function getDailyReport(req, res, next) {
  try {
    const userId = req.user.id;
    const dateParam = req.query.date ? normalizeDateString(req.query.date) : getTodayString();

    if (!dateParam) {
      return res.status(400).json({ message: "Invalid date parameter. Format: YYYY-MM-DD" });
    }

    const dateUtc = parseDateToUtcMidnight(dateParam);

    const readings = await prisma.reading.findMany({
      where: {
        userId,
        date: dateUtc,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const stats = calculateStats(readings);

    return res.status(200).json({
      reportType: "daily",
      date: dateParam,
      ...stats,
      readings: readings.map(formatReading),
    });
  } catch (error) {
    next(error);
  }
}

// B. Month-to-date Report
async function getMonthToDateReport(req, res, next) {
  try {
    const userId = req.user.id;
    const dateParam = req.query.date ? normalizeDateString(req.query.date) : getTodayString();

    if (!dateParam) {
      return res.status(400).json({ message: "Invalid date parameter. Format: YYYY-MM-DD" });
    }

    const [yearStr, monthStr] = dateParam.split("-");
    const startDateStr = `${yearStr}-${monthStr}-01`;
    const endDateStr = dateParam;

    const startDateUtc = parseDateToUtcMidnight(startDateStr);
    const endDateUtc = parseDateToUtcMidnight(endDateStr);

    const readings = await prisma.reading.findMany({
      where: {
        userId,
        date: {
          gte: startDateUtc,
          lte: endDateUtc,
        },
      },
      orderBy: [
        { date: "asc" },
        { createdAt: "asc" },
      ],
    });

    const stats = calculateStats(readings);

    return res.status(200).json({
      reportType: "month-to-date",
      selectedDate: dateParam,
      startDate: startDateStr,
      endDate: endDateStr,
      ...stats,
      readings: readings.map(formatReading),
    });
  } catch (error) {
    next(error);
  }
}

// C. Previous Month Report
async function getPreviousMonthReport(req, res, next) {
  try {
    const userId = req.user.id;
    const refDateParam = req.query.date ? normalizeDateString(req.query.date) : getTodayString();

    if (!refDateParam) {
      return res.status(400).json({ message: "Invalid date parameter. Format: YYYY-MM-DD" });
    }

    const [refYear, refMonth] = refDateParam.split("-").map(Number);

    // Calculate previous month and year
    let prevMonth = refMonth - 1;
    let prevYear = refYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const prevMonthPadded = String(prevMonth).padStart(2, "0");
    const startDateStr = `${prevYear}-${prevMonthPadded}-01`;

    // Last day of previous month: day 0 of current month in UTC
    const lastDayOfMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
    const endDateStr = `${prevYear}-${prevMonthPadded}-${String(lastDayOfMonth).padStart(2, "0")}`;

    const startDateUtc = parseDateToUtcMidnight(startDateStr);
    const endDateUtc = parseDateToUtcMidnight(endDateStr);

    const readings = await prisma.reading.findMany({
      where: {
        userId,
        date: {
          gte: startDateUtc,
          lte: endDateUtc,
        },
      },
      orderBy: [
        { date: "asc" },
        { createdAt: "asc" },
      ],
    });

    const stats = calculateStats(readings);

    return res.status(200).json({
      reportType: "previous-month",
      referenceDate: refDateParam,
      year: prevYear,
      month: prevMonth,
      startDate: startDateStr,
      endDate: endDateStr,
      ...stats,
      readings: readings.map(formatReading),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
  calculateStats,
};

