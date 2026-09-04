import { Router } from "express";
import { verifyToken, restrictTo } from "../middleware/auth.js";
import {
  createPrescription,
  getPrescription,
  updatePrescription,
  getPatientPrescriptions,
} from "../controllers/prescriptionController.js";

const router = Router();

// All prescription routes require authentication
router.use(verifyToken);

// Doctor creates/updates prescription for a session
router.post("/:sessionId", restrictTo("doctor"), createPrescription);
router.put("/:sessionId", restrictTo("doctor"), updatePrescription);

// Get all prescriptions for logged-in patient
router.get("/patient/all", restrictTo("patient"), getPatientPrescriptions);

// Get prescription by session ID (both doctor and patient can access)
router.get("/:sessionId", getPrescription);

export default router;
