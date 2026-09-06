import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server as SocketServer } from "socket.io";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// ─── Import Routes ──────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import documentRoutes from "./routes/document.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import patientChatRoutes from "./routes/patientChat.routes.js";
import healthTrackerRoutes from "./routes/healthTracker.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

// ─── Initialize Express App ──────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible in controllers
app.set("io", io);

// ─── Middleware ──────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "16mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(morgan("dev")); // Request logging

// ─── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/patient-chat", patientChatRoutes);
app.use("/api/health-tracker", healthTrackerRoutes);
app.use("/api/appointment", appointmentRoutes);

// ─── Health Check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SwasthyaSetu API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use("{*path}", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Socket.io Events ───────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(` Client connected: ${socket.id}`);

  // Patient joins their session room
  socket.on("join-session", ({ sessionId }) => {
    socket.join(`session-${sessionId}`);
    console.log(`Socket ${socket.id} joined session: ${sessionId}`);
  });

  // Doctor joins the doctor room
  socket.on("join-doctor-room", () => {
    socket.join("doctor-room");
    console.log(`Doctor joined: ${socket.id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    server.listen(PORT, () => {
      console.log(`SwasthyaSetu Backend Server`);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
