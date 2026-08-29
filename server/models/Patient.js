import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    abhaId: {
      type: String,
      unique: true,
      sparse: true, // Allows null (for patients without ABHA)
      index: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["hi", "en", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"],
      default: "hi",
    },
    // Sessions linked to this patient
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
