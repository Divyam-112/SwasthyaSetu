import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  startSession,
  getSession,
  getPatientSessions,
} from "../controllers/sessionController.js";

const router = Router();

// Start new session
router.post("/start", verifyToken, startSession);

// Get session by ID
router.get("/:sessionId", verifyToken, getSession);

// Get all sessions for logged-in patient
router.get("/patient/all", verifyToken, getPatientSessions);

export default router;
