import mongoose from "mongoose";

const patientChatSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    // Optional: link to a specific session for context
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    // Snapshot of the clinical summary used as context
    contextSummary: {
      type: String,
      default: "",
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["patient", "ai"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for quick lookups
patientChatSchema.index({ patient: 1, createdAt: -1 });
patientChatSchema.index({ patient: 1, isActive: 1 });

const PatientChat = mongoose.model("PatientChat", patientChatSchema);
export default PatientChat;
