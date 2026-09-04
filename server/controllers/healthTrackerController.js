import HealthTracker from "../models/HealthTracker.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── HELPER: Get or create tracker for patient ─────────────────────
async function getOrCreateTracker(patientId) {
  let tracker = await HealthTracker.findOne({ patient: patientId });
  if (!tracker) {
    tracker = await HealthTracker.create({
      patient: patientId,
      healthReadings: [],
      medicineReminders: [],
      exerciseReminders: [],
    });
  }
  return tracker;
}

// ═══════════════════════════════════════════════════════════════════
// ─── HEALTH READINGS ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/health-tracker/reading
 * Add a health reading (blood sugar, BP, weight, etc.)
 */
export const addReading = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { type, value, secondaryValue, unit, measuredAt, mealContext, notes } =
    req.body;

  if (!type || value === undefined || !unit) {
    throw new ApiError(400, "Type, value, and unit are required");
  }

  // Validate BP requires secondaryValue (diastolic)
  if (type === "blood_pressure" && !secondaryValue) {
    throw new ApiError(
      400,
      "Blood pressure requires both systolic (value) and diastolic (secondaryValue)",
    );
  }

  const tracker = await getOrCreateTracker(patientId);

  const reading = {
    type,
    value,
    secondaryValue: secondaryValue || undefined,
    unit,
    measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
    mealContext: mealContext || "not_applicable",
    notes: notes || "",
  };

  tracker.healthReadings.push(reading);
  await tracker.save();

  // Return the newly added reading
  const addedReading =
    tracker.healthReadings[tracker.healthReadings.length - 1];

  res
    .status(201)
    .json(new ApiResponse(201, addedReading, "Health reading added successfully"));
});

/**
 * GET /api/health-tracker/readings
 * Get health readings filtered by type and date range (for graphs)
 * Query params: ?type=blood_sugar&days=30
 */
export const getReadings = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { type, days } = req.query;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No health readings found"));
  }

  let readings = tracker.healthReadings;

  // Filter by type if specified
  if (type) {
    readings = readings.filter((r) => r.type === type);
  }

  // Filter by date range if specified
  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    readings = readings.filter((r) => new Date(r.measuredAt) >= cutoffDate);
  }

  // Sort by measurement date (newest first)
  readings.sort(
    (a, b) => new Date(b.measuredAt) - new Date(a.measuredAt),
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, readings, "Health readings retrieved successfully"),
    );
});

/**
 * DELETE /api/health-tracker/reading/:readingId
 * Delete a specific health reading
 */
export const deleteReading = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { readingId } = req.params;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    throw new ApiError(404, "Health tracker not found");
  }

  const readingIndex = tracker.healthReadings.findIndex(
    (r) => r._id.toString() === readingId,
  );

  if (readingIndex === -1) {
    throw new ApiError(404, "Reading not found");
  }

  tracker.healthReadings.splice(readingIndex, 1);
  await tracker.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Health reading deleted successfully"));
});

// ═══════════════════════════════════════════════════════════════════
// ─── MEDICINE REMINDERS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/health-tracker/medicine-reminder
 * Add a medicine reminder
 */
export const addMedicineReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const {
    medicineName,
    dosage,
    frequency,
    times,
    startDate,
    endDate,
    notes,
  } = req.body;

  if (!medicineName) {
    throw new ApiError(400, "Medicine name is required");
  }

  const tracker = await getOrCreateTracker(patientId);

  const reminder = {
    medicineName,
    dosage: dosage || "",
    frequency: frequency || "once_daily",
    times: times || ["08:00"],
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : undefined,
    isActive: true,
    notes: notes || "",
  };

  tracker.medicineReminders.push(reminder);
  await tracker.save();

  const addedReminder =
    tracker.medicineReminders[tracker.medicineReminders.length - 1];

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        addedReminder,
        "Medicine reminder added successfully",
      ),
    );
});

/**
 * GET /api/health-tracker/medicine-reminders
 * Get all medicine reminders (optionally filter active only)
 * Query: ?active=true
 */
export const getMedicineReminders = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { active } = req.query;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No medicine reminders found"));
  }

  let reminders = tracker.medicineReminders;

  if (active === "true") {
    reminders = reminders.filter((r) => r.isActive);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reminders,
        "Medicine reminders retrieved successfully",
      ),
    );
});

/**
 * PUT /api/health-tracker/medicine-reminder/:reminderId
 * Update a medicine reminder
 */
export const updateMedicineReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { reminderId } = req.params;
  const {
    medicineName,
    dosage,
    frequency,
    times,
    startDate,
    endDate,
    isActive,
    notes,
  } = req.body;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    throw new ApiError(404, "Health tracker not found");
  }

  const reminder = tracker.medicineReminders.id(reminderId);

  if (!reminder) {
    throw new ApiError(404, "Medicine reminder not found");
  }

  // Update fields if provided
  if (medicineName !== undefined) reminder.medicineName = medicineName;
  if (dosage !== undefined) reminder.dosage = dosage;
  if (frequency !== undefined) reminder.frequency = frequency;
  if (times !== undefined) reminder.times = times;
  if (startDate !== undefined) reminder.startDate = new Date(startDate);
  if (endDate !== undefined) reminder.endDate = new Date(endDate);
  if (isActive !== undefined) reminder.isActive = isActive;
  if (notes !== undefined) reminder.notes = notes;

  await tracker.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reminder,
        "Medicine reminder updated successfully",
      ),
    );
});

/**
 * DELETE /api/health-tracker/medicine-reminder/:reminderId
 * Delete a medicine reminder
 */
export const deleteMedicineReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { reminderId } = req.params;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    throw new ApiError(404, "Health tracker not found");
  }

  const reminderIndex = tracker.medicineReminders.findIndex(
    (r) => r._id.toString() === reminderId,
  );

  if (reminderIndex === -1) {
    throw new ApiError(404, "Medicine reminder not found");
  }

  tracker.medicineReminders.splice(reminderIndex, 1);
  await tracker.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Medicine reminder deleted successfully"),
    );
});

// ═══════════════════════════════════════════════════════════════════
// ─── EXERCISE REMINDERS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/health-tracker/exercise-reminder
 * Add an exercise reminder
 */
export const addExerciseReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const {
    exerciseName,
    exerciseType,
    duration,
    frequency,
    preferredTime,
    notes,
  } = req.body;

  if (!exerciseName) {
    throw new ApiError(400, "Exercise name is required");
  }

  const tracker = await getOrCreateTracker(patientId);

  const reminder = {
    exerciseName,
    exerciseType: exerciseType || "walking",
    duration: duration || 30,
    frequency: frequency || "daily",
    preferredTime: preferredTime || "06:00",
    isActive: true,
    notes: notes || "",
  };

  tracker.exerciseReminders.push(reminder);
  await tracker.save();

  const addedReminder =
    tracker.exerciseReminders[tracker.exerciseReminders.length - 1];

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        addedReminder,
        "Exercise reminder added successfully",
      ),
    );
});

/**
 * GET /api/health-tracker/exercise-reminders
 * Get all exercise reminders
 * Query: ?active=true
 */
export const getExerciseReminders = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { active } = req.query;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No exercise reminders found"));
  }

  let reminders = tracker.exerciseReminders;

  if (active === "true") {
    reminders = reminders.filter((r) => r.isActive);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reminders,
        "Exercise reminders retrieved successfully",
      ),
    );
});

/**
 * PUT /api/health-tracker/exercise-reminder/:reminderId
 * Update an exercise reminder
 */
export const updateExerciseReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { reminderId } = req.params;
  const {
    exerciseName,
    exerciseType,
    duration,
    frequency,
    preferredTime,
    isActive,
    notes,
  } = req.body;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    throw new ApiError(404, "Health tracker not found");
  }

  const reminder = tracker.exerciseReminders.id(reminderId);

  if (!reminder) {
    throw new ApiError(404, "Exercise reminder not found");
  }

  // Update fields if provided
  if (exerciseName !== undefined) reminder.exerciseName = exerciseName;
  if (exerciseType !== undefined) reminder.exerciseType = exerciseType;
  if (duration !== undefined) reminder.duration = duration;
  if (frequency !== undefined) reminder.frequency = frequency;
  if (preferredTime !== undefined) reminder.preferredTime = preferredTime;
  if (isActive !== undefined) reminder.isActive = isActive;
  if (notes !== undefined) reminder.notes = notes;

  await tracker.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reminder,
        "Exercise reminder updated successfully",
      ),
    );
});

/**
 * DELETE /api/health-tracker/exercise-reminder/:reminderId
 * Delete an exercise reminder
 */
export const deleteExerciseReminder = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { reminderId } = req.params;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    throw new ApiError(404, "Health tracker not found");
  }

  const reminderIndex = tracker.exerciseReminders.findIndex(
    (r) => r._id.toString() === reminderId,
  );

  if (reminderIndex === -1) {
    throw new ApiError(404, "Exercise reminder not found");
  }

  tracker.exerciseReminders.splice(reminderIndex, 1);
  await tracker.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Exercise reminder deleted successfully"),
    );
});

// ═══════════════════════════════════════════════════════════════════
// ─── DASHBOARD ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/health-tracker/dashboard
 * Get a combined dashboard view: latest readings, active reminders, stats
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const patientId = req.userId;

  const tracker = await HealthTracker.findOne({ patient: patientId });

  if (!tracker) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          latestReadings: {},
          activeMedicineReminders: [],
          activeExerciseReminders: [],
          stats: {
            totalReadings: 0,
            totalMedicineReminders: 0,
            totalExerciseReminders: 0,
          },
        },
        "No health data yet. Start tracking your health!",
      ),
    );
  }

  // Get latest reading for each type
  const readingTypes = [
    "blood_sugar",
    "blood_pressure",
    "weight",
    "heart_rate",
    "temperature",
  ];
  const latestReadings = {};

  for (const type of readingTypes) {
    const typeReadings = tracker.healthReadings
      .filter((r) => r.type === type)
      .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt));

    if (typeReadings.length > 0) {
      latestReadings[type] = {
        latest: typeReadings[0],
        count: typeReadings.length,
      };
    }
  }

  // Get active reminders
  const activeMedicineReminders = tracker.medicineReminders.filter(
    (r) => r.isActive,
  );
  const activeExerciseReminders = tracker.exerciseReminders.filter(
    (r) => r.isActive,
  );

  // Stats
  const stats = {
    totalReadings: tracker.healthReadings.length,
    totalMedicineReminders: tracker.medicineReminders.length,
    activeMedicineReminders: activeMedicineReminders.length,
    totalExerciseReminders: tracker.exerciseReminders.length,
    activeExerciseReminders: activeExerciseReminders.length,
  };

  // Get readings from last 7 days for quick trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentReadings = tracker.healthReadings
    .filter((r) => new Date(r.measuredAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        latestReadings,
        activeMedicineReminders,
        activeExerciseReminders,
        recentReadings,
        stats,
      },
      "Dashboard data retrieved successfully",
    ),
  );
});
