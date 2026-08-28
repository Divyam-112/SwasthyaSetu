import { Router } from "express";
import { verifyToken, restrictTo } from "../middleware/auth.js";
import {
  getPatientQueue,
  getPatientDetail,
  submitReview,
} from "../controllers/doctorController.js";

const router = Router();

// All doctor routes require doctor role
router.use(verifyToken, restrictTo("doctor"));

// Get patient queue
router.get("/queue", getPatientQueue);

// Get patient details
router.get("/patient/:sessionId", getPatientDetail);

// Submit review
router.put("/review/:sessionId", submitReview);

export default router;
