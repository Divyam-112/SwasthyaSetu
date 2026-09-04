import { Router } from "express";
import { verifyToken, restrictTo } from "../middleware/auth.js";
import {
  startChat,
  sendMessage,
  getChatHistory,
  getAllChats,
} from "../controllers/patientChatController.js";

const router = Router();

// All patient chat routes require patient role
router.use(verifyToken, restrictTo("patient"));

// Start a new chat session
router.post("/start", startChat);

// Send a message in an active chat
router.post("/message", sendMessage);

// Get all chats for the logged-in patient
router.get("/all", getAllChats);

// Get chat history for a specific chat
router.get("/history/:chatId", getChatHistory);

export default router;
