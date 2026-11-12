const prisma = require("../config/prisma");
const {
  validateReadingInput,
  getDuplicateSlotMessage,
  normalizeDateString,
  parseDateToUtcMidnight,
} = require("../utils/validators");

function formatReading(reading) {
  if (!reading) return null;
  const d = new Date(reading.date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return {
    id: reading.id,
    userId: reading.userId,
    date: `${year}-${month}-${day}`,
    timeSlot: reading.timeSlot,
    value: reading.value,
    createdAt: reading.createdAt,
    updatedAt: reading.updatedAt,
  };
}

async function createReading(req, res, next) {
  try {
    const validation = validateReadingInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const { dateUtc, timeSlot, value } = validation.data;
    const userId = req.user.id;

    try {
      const newReading = await prisma.$transaction(async (tx) => {
        // Check maximum 4 readings per day limit
        const count = await tx.reading.count({
          where: {
            userId,
            date: dateUtc,
          },
        });

        if (count >= 4) {
          const err = new Error("You can add only 4 readings per day.");
          err.status = 400;
          throw err;
        }

        // Check if a reading for this slot on this date already exists
        const existingSlot = await tx.reading.findFirst({
          where: {
            userId,
            date: dateUtc,
            timeSlot,
          },
        });

        if (existingSlot) {
          const err = new Error(getDuplicateSlotMessage(timeSlot));
          err.status = 400;
          throw err;
        }

        return await tx.reading.create({
          data: {
            userId,
            date: dateUtc,
            timeSlot,
            value,
          },
        });
      });

      return res.status(201).json({
        message: "Reading created successfully.",
        reading: formatReading(newReading),
      });
    } catch (txError) {
      if (txError.status) {
        return res.status(txError.status).json({ message: txError.message });
      }
      if (txError.code === "P2002") {
        return res.status(400).json({ message: getDuplicateSlotMessage(timeSlot) });
      }
      throw txError;
    }
  } catch (error) {
    next(error);
  }
}

async function getReadings(req, res, next) {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const where = { userId };

    if (date) {
      const normalized = normalizeDateString(date);
      if (normalized) {
        where.date = parseDateToUtcMidnight(normalized);
      }
    }

    const readings = await prisma.reading.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json({
      count: readings.length,
      readings: readings.map(formatReading),
    });
  } catch (error) {
    next(error);
  }
}

async function getReadingById(req, res, next) {
  try {
    const readingId = Number(req.params.id);
    if (!Number.isInteger(readingId)) {
      return res.status(400).json({ message: "Invalid reading ID." });
    }

    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId: req.user.id,
      },
    });

    if (!reading) {
      return res.status(404).json({ message: "Reading not found." });
    }

    return res.status(200).json({
      reading: formatReading(reading),
    });
  } catch (error) {
    next(error);
  }
}

async function updateReading(req, res, next) {
  try {
    const readingId = Number(req.params.id);
    if (!Number.isInteger(readingId)) {
      return res.status(400).json({ message: "Invalid reading ID." });
    }

    const userId = req.user.id;

    const existing = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Reading not found." });
    }

    // Prepare merged data for validation
    const targetDate = req.body.date !== undefined ? req.body.date : formatReading(existing).date;
    const targetSlot = req.body.timeSlot !== undefined ? req.body.timeSlot : existing.timeSlot;
    const targetValue = req.body.value !== undefined ? req.body.value : existing.value;

    const validation = validateReadingInput({
      date: targetDate,
      timeSlot: targetSlot,
      value: targetValue,
    });

    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const { dateUtc, timeSlot, value } = validation.data;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // When editing, do not incorrectly count existing reading against 4 limit
        const count = await tx.reading.count({
          where: {
            userId,
            date: dateUtc,
            id: { not: readingId },
          },
        });

        if (count >= 4) {
          const err = new Error("You can add only 4 readings per day.");
          err.status = 400;
          throw err;
        }

        // Check duplicate slot conflict excluding this reading
        const slotConflict = await tx.reading.findFirst({
          where: {
            userId,
            date: dateUtc,
            timeSlot,
            id: { not: readingId },
          },
        });

        if (slotConflict) {
          const err = new Error(getDuplicateSlotMessage(timeSlot));
          err.status = 400;
          throw err;
        }

        return await tx.reading.update({
          where: { id: readingId },
          data: {
            date: dateUtc,
            timeSlot,
            value,
          },
        });
      });

      return res.status(200).json({
        message: "Reading updated successfully.",
        reading: formatReading(updated),
      });
    } catch (txError) {
      if (txError.status) {
        return res.status(txError.status).json({ message: txError.message });
      }
      if (txError.code === "P2002") {
        return res.status(400).json({ message: getDuplicateSlotMessage(timeSlot) });
      }
      throw txError;
    }
  } catch (error) {
    next(error);
  }
}

async function deleteReading(req, res, next) {
  try {
    const readingId = Number(req.params.id);
    if (!Number.isInteger(readingId)) {
      return res.status(400).json({ message: "Invalid reading ID." });
    }

    const userId = req.user.id;

    const existing = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Reading not found." });
    }

    await prisma.reading.delete({
      where: { id: readingId },
    });

    return res.status(200).json({
      message: "Reading deleted successfully.",
      id: readingId,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
  formatReading,
};
