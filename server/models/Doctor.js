import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    specialization: {
      type: String,
      enum: [
        "General Medicine",
        "Ayurveda",
        "Pediatrics",
        "Surgery",
        "Gynecology",
        "Dermatology",
        "Orthopedics",
        "ENT",
        "Ophthalmology",
        "Other",
      ],
      default: "General Medicine",
    },
    hospitalId: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["doctor", "admin"],
      default: "doctor",
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
