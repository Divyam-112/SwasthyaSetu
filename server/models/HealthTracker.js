import mongoose from "mongoose";

const healthTrackerSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
      unique: true, // One tracker per patient
    },

    // ─── Health Readings (BP, Sugar, Weight, etc.) ─────────────────
    healthReadings: [
      {
        type: {
          type: String,
          enum: [
            "blood_sugar",
            "blood_pressure",
            "weight",
            "heart_rate",
            "temperature",
          ],
          required: [true, "Reading type is required"],
        },
        value: {
          type: Number,
          required: [true, "Reading value is required"],
        },
        // For blood pressure: value = systolic, secondaryValue = diastolic
        secondaryValue: {
          type: Number,
        },
        unit: {
          type: String,
          required: true,
        },
        measuredAt: {
          type: Date,
          default: Date.now,
        },
        // For blood sugar: fasting, post_meal, random
        mealContext: {
          type: String,
          enum: ["fasting", "post_meal", "random", "not_applicable"],
          default: "not_applicable",
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],

    // ─── Medicine Reminders ────────────────────────────────────────
    medicineReminders: [
      {
        medicineName: {
          type: String,
          required: [true, "Medicine name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          trim: true,
        },
        frequency: {
          type: String,
          enum: [
            "once_daily",
            "twice_daily",
            "thrice_daily",
            "four_times_daily",
            "weekly",
            "alternate_days",
            "as_needed",
          ],
          default: "once_daily",
        },
        times: [
          {
            type: String, // "08:00", "14:00", "20:00"
          },
        ],
        startDate: {
          type: Date,
          default: Date.now,
        },
        endDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],

    // ─── Exercise Reminders ────────────────────────────────────────
    exerciseReminders: [
      {
        exerciseName: {
          type: String,
          required: [true, "Exercise name is required"],
          trim: true,
        },
        exerciseType: {
          type: String,
          enum: [
            "yoga",
            "pranayama",
            "walking",
            "stretching",
            "gym",
            "swimming",
            "cycling",
            "meditation",
            "other",
          ],
          default: "walking",
        },
        duration: {
          type: Number, // in minutes
          default: 30,
        },
        frequency: {
          type: String,
          enum: ["daily", "alternate_days", "weekly", "weekdays", "custom"],
          default: "daily",
        },
        preferredTime: {
          type: String, // "06:00"
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const HealthTracker = mongoose.model("HealthTracker", healthTrackerSchema);
export default HealthTracker;
