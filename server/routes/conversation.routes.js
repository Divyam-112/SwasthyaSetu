import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  respondToQuestion,
  respondVoice,
  getConversation,
} from "../controllers/conversationController.js";
import {
  getSupportedLanguages,
  getSpeechConfig,
} from "../services/speechService.js";

const router = Router();

// Text/touch response
router.post("/respond", verifyToken, respondToQuestion);

// Voice response (client sends transcribed text via Web Speech API)
router.post("/voice", verifyToken, respondVoice);

// Get conversation history
router.get("/:sessionId", verifyToken, getConversation);

// ─── Speech Config Endpoints (for client-side Web Speech API) ────

// Get supported languages
router.get("/speech/languages", (req, res) => {
  res.json({
    success: true,
    data: getSupportedLanguages(),
    message: "Supported languages for speech recognition",
  });
});

// Get speech config for a specific language
router.get("/speech/config/:langCode", (req, res) => {
  const { langCode } = req.params;
  const config = getSpeechConfig(langCode);
  res.json({
    success: true,
    data: config,
    message: `Speech config for ${config.languageInfo.name}`,
  });
});

export default router;
