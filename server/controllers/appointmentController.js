import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/appointment/doctors
 * Patient views available doctors (optionally filtered by specialization)
 * Query: ?specialization=Ayurveda
 */
export const getAvailableDoctors = asyncHandler(async (req, res) => {
  const { specialization } = req.query;

  const filter = { role: "doctor" };
  if (specialization) {
    filter.specialization = specialization;
  }

  const doctors = await Doctor.find(filter).select(
    "name specialization hospitalId",
  );

  // For each doctor, get today's appointment count for queue info
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const doctorsWithQueue = await Promise.all(
    doctors.map(async (doctor) => {
      const todayAppointments = await Appointment.countDocuments({
        doctor: doctor._id,
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: { $in: ["booked", "in_progress"] },
      });

      return {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        hospitalId: doctor.hospitalId,
        todayQueueCount: todayAppointments,
      };
    }),
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        doctorsWithQueue,
        "Available doctors retrieved successfully",
      ),
    );
});

/**
 * POST /api/appointment/book
 * Patient books an appointment with a selected doctor
 */
export const bookAppointment = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { doctorId, sessionId, scheduledDate, preferredTimeSlot, reason } =
    req.body;

  if (!doctorId || !sessionId) {
    throw new ApiError(400, "Doctor ID and Session ID are required");
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Verify session exists and belongs to this patient
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  if (session.patient.toString() !== patientId) {
    throw new ApiError(403, "This session does not belong to you");
  }

  // Check if an active appointment already exists for this session
  const existingAppointment = await Appointment.findOne({
    session: sessionId,
    status: { $in: ["booked", "in_progress"] },
  });
  if (existingAppointment) {
    throw new ApiError(
      400,
      "An active appointment already exists for this session. Cancel it first to rebook.",
    );
  }

  // Determine the scheduled date (default: today)
  const appointmentDate = scheduledDate ? new Date(scheduledDate) : new Date();

  // Auto-derive reason from session's chief complaint if not provided
  const appointmentReason =
    reason || session.clinicalHistory?.chiefComplaint || "General consultation";

  // Create the appointment
  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    session: sessionId,
    scheduledDate: appointmentDate,
    preferredTimeSlot: preferredTimeSlot || "any",
    reason: appointmentReason,
  });

  // Link the appointment to the session
  session.appointment = appointment._id;
  await session.save();

  // Populate for response
  await appointment.populate("doctor", "name specialization");
  await appointment.populate("patient", "name age gender abhaId");

  // Emit socket event to notify doctor
  const io = req.app.get("io");
  if (io) {
    io.to("doctor-room").emit("new-appointment", {
      appointmentId: appointment._id,
      patientName: appointment.patient?.name,
      tokenNumber: appointment.tokenNumber,
      reason: appointment.reason,
      doctorId: doctorId,
    });
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        appointmentId: appointment._id,
        tokenNumber: appointment.tokenNumber,
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization,
        },
        scheduledDate: appointment.scheduledDate,
        preferredTimeSlot: appointment.preferredTimeSlot,
        status: appointment.status,
        reason: appointment.reason,
      },
      `Appointment booked successfully! Your token number is ${appointment.tokenNumber}`,
    ),
  );
});

/**
 * GET /api/appointment/my-appointments
 * Patient views their appointment history
 * Query: ?status=booked
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { status } = req.query;

  const filter = { patient: patientId };
  if (status) {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate("doctor", "name specialization")
    .populate("session", "sessionType clinicalHistory.chiefComplaint createdAt")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Appointments retrieved successfully",
      ),
    );
});

/**
 * PUT /api/appointment/cancel/:appointmentId
 * Patient cancels their appointment
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { appointmentId } = req.params;
  const { reason } = req.body;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.patient.toString() !== patientId) {
    throw new ApiError(403, "This appointment does not belong to you");
  }

  if (appointment.status !== "booked") {
    throw new ApiError(
      400,
      `Cannot cancel appointment with status: ${appointment.status}`,
    );
  }

  appointment.status = "cancelled";
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = reason || "";
  await appointment.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment cancelled successfully"),
    );
});

// ═══════════════════════════════════════════════════════════════════
// ─── DOCTOR-SIDE APPOINTMENT ENDPOINTS ───────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/appointment/doctor/queue
 * Doctor views ONLY their assigned appointments (replaces generic queue)
 * Query: ?date=2026-09-06&status=booked
 */
export const getDoctorQueue = asyncHandler(async (req, res) => {
  const doctorId = req.userId;
  const { date, status } = req.query;

  // Default to today
  const targetDate = date ? new Date(date) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const filter = {
    doctor: doctorId,
    scheduledDate: { $gte: dayStart, $lte: dayEnd },
  };

  if (status) {
    filter.status = status;
  } else {
    // By default show active appointments
    filter.status = { $in: ["booked", "in_progress"] };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient", "name age gender abhaId preferredLanguage phone")
    .populate({
      path: "session",
      select:
        "sessionType status completionPercentage clinicalHistory.chiefComplaint clinicalSummary.redFlags clinicalSummary.generatedText createdAt",
    })
    .sort({ tokenNumber: 1 });

  // Format for queue display
  const queue = appointments.map((apt) => ({
    appointmentId: apt._id,
    tokenNumber: apt.tokenNumber,
    patientName: apt.patient?.name || "Unknown",
    age: apt.patient?.age,
    gender: apt.patient?.gender,
    abhaId: apt.patient?.abhaId,
    phone: apt.patient?.phone,
    sessionId: apt.session?._id,
    sessionType: apt.session?.sessionType,
    chiefComplaint:
      apt.reason ||
      apt.session?.clinicalHistory?.chiefComplaint ||
      "Not recorded yet",
    sessionStatus: apt.session?.status,
    completionPercentage: apt.session?.completionPercentage,
    hasRedFlags: apt.session?.clinicalSummary?.redFlags?.length > 0,
    redFlags: apt.session?.clinicalSummary?.redFlags || [],
    hasSummary: !!apt.session?.clinicalSummary?.generatedText,
    appointmentStatus: apt.status,
    preferredTimeSlot: apt.preferredTimeSlot,
    scheduledDate: apt.scheduledDate,
    createdAt: apt.createdAt,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        date: targetDate.toISOString().split("T")[0],
        totalAppointments: queue.length,
        queue,
      },
      "Doctor queue retrieved successfully",
    ),
  );
});

/**
 * PUT /api/appointment/doctor/status/:appointmentId
 * Doctor updates appointment status (start, complete, mark no-show)
 */
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const doctorId = req.userId;
  const { appointmentId } = req.params;
  const { status, doctorNotes } = req.body;

  const validStatuses = ["in_progress", "completed", "no_show"];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Valid status is required: ${validStatuses.join(", ")}`,
    );
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.doctor.toString() !== doctorId) {
    throw new ApiError(403, "This appointment is not assigned to you");
  }

  // Status transition validation
  if (status === "in_progress" && appointment.status !== "booked") {
    throw new ApiError(400, "Can only start a booked appointment");
  }
  if (
    status === "completed" &&
    !["booked", "in_progress"].includes(appointment.status)
  ) {
    throw new ApiError(400, "Can only complete a booked or in-progress appointment");
  }

  appointment.status = status;
  if (doctorNotes) appointment.doctorNotes = doctorNotes;
  if (status === "completed") appointment.completedAt = new Date();

  await appointment.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        appointmentId: appointment._id,
        tokenNumber: appointment.tokenNumber,
        status: appointment.status,
        completedAt: appointment.completedAt,
      },
      `Appointment ${status === "in_progress" ? "started" : status} successfully`,
    ),
  );
});
