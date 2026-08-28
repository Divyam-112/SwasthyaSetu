import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  registerPatient,
  loginPatient,
  recordConsent,
  registerDoctor,
  loginDoctor,
} from "../controllers/authController.js";

const router = Router();

// Patient auth
router.post("/patient/register", registerPatient);
router.post("/patient/login", loginPatient);
router.post("/patient/consent", verifyToken, recordConsent);

// Doctor auth
router.post("/doctor/register", registerDoctor);
router.post("/doctor/login", loginDoctor);

export default router;
