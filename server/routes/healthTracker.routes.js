import { Router } from "express";
import { verifyToken, restrictTo } from "../middleware/auth.js";
import {
  addReading,
  getReadings,
  deleteReading,
  addMedicineReminder,
  getMedicineReminders,
  updateMedicineReminder,
  deleteMedicineReminder,
  addExerciseReminder,
  getExerciseReminders,
  updateExerciseReminder,
  deleteExerciseReminder,
  getDashboard,
} from "../controllers/healthTrackerController.js";

const router = Router();

// All health tracker routes require patient role
router.use(verifyToken, restrictTo("patient"));

// ─── Dashboard ───────────────────────────────────────────────────
router.get("/dashboard", getDashboard);

// ─── Health Readings ─────────────────────────────────────────────
router.post("/reading", addReading);
router.get("/readings", getReadings); // ?type=blood_sugar&days=30
router.delete("/reading/:readingId", deleteReading);

// ─── Medicine Reminders ──────────────────────────────────────────
router.post("/medicine-reminder", addMedicineReminder);
router.get("/medicine-reminders", getMedicineReminders); // ?active=true
router.put("/medicine-reminder/:reminderId", updateMedicineReminder);
router.delete("/medicine-reminder/:reminderId", deleteMedicineReminder);

// ─── Exercise Reminders ──────────────────────────────────────────
router.post("/exercise-reminder", addExerciseReminder);
router.get("/exercise-reminders", getExerciseReminders); // ?active=true
router.put("/exercise-reminder/:reminderId", updateExerciseReminder);
router.delete("/exercise-reminder/:reminderId", deleteExerciseReminder);

export default router;
