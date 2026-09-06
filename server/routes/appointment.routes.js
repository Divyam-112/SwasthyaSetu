import { Router } from "express";
import { verifyToken, restrictTo } from "../middleware/auth.js";
import {
  getAvailableDoctors,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorQueue,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// ─── Patient-side Routes ─────────────────────────────────────────
// View available doctors (patients can see doctor list)
router.get("/doctors", restrictTo("patient"), getAvailableDoctors);

// Book an appointment with a doctor
router.post("/book", restrictTo("patient"), bookAppointment);

// View patient's own appointments
router.get(
  "/my-appointments",
  restrictTo("patient"),
  getMyAppointments,
);

// Cancel an appointment
router.put(
  "/cancel/:appointmentId",
  restrictTo("patient"),
  cancelAppointment,
);

// ─── Doctor-side Routes ──────────────────────────────────────────
// Get doctor's assigned patient queue for a day
router.get("/doctor/queue", restrictTo("doctor"), getDoctorQueue);

// Update appointment status (start, complete, no-show)
router.put(
  "/doctor/status/:appointmentId",
  restrictTo("doctor"),
  updateAppointmentStatus,
);

export default router;
