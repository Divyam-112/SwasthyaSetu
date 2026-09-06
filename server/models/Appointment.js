import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
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
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "Session reference is required"],
    },
    // Token number for OPD queue (auto-generated per doctor per day)
    tokenNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["booked", "in_progress", "completed", "cancelled", "no_show"],
      default: "booked",
    },
    // Reason / chief complaint for quick doctor reference
    reason: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    // Optional preferred time slot
    preferredTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening", "any"],
      default: "any",
    },
    // Doctor's notes after appointment
    doctorNotes: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
appointmentSchema.index({ doctor: 1, scheduledDate: 1, status: 1 });
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ session: 1 });

// Pre-save: Auto-generate token number per doctor per day
appointmentSchema.pre("save", async function (next) {
  if (this.isNew && !this.tokenNumber) {
    // Get the start and end of the scheduled date
    const dayStart = new Date(this.scheduledDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(this.scheduledDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Count existing appointments for this doctor on this day
    const count = await mongoose.model("Appointment").countDocuments({
      doctor: this.doctor,
      scheduledDate: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "cancelled" },
    });

    this.tokenNumber = count + 1;
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
