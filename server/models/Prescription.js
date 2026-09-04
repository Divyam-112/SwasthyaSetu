import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "Session reference is required"],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor reference is required"],
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    medications: [
      {
        name: {
          type: String,
          required: [true, "Medicine name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          trim: true,
        },
        frequency: {
          type: String,
          enum: [
            "Once daily",
            "Twice daily",
            "Thrice daily",
            "Four times daily",
            "Every 6 hours",
            "Every 8 hours",
            "Every 12 hours",
            "Weekly",
            "As needed",
            "Other",
          ],
          default: "Twice daily",
        },
        duration: {
          type: String,
          trim: true,
        },
        timing: {
          type: String,
          enum: [
            "Before food",
            "After food",
            "With food",
            "Empty stomach",
            "Bedtime",
            "Morning",
            "Evening",
            "Any time",
          ],
          default: "After food",
        },
        instructions: {
          type: String,
          trim: true,
        },
      },
    ],
    investigations: [
      {
        type: String,
        trim: true,
      },
    ],
    advice: [
      {
        type: String,
        trim: true,
      },
    ],
    followUpDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for quick lookups
prescriptionSchema.index({ session: 1 });
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
