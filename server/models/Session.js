import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["allopathic", "ayush"],
      default: "allopathic",
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "reviewed", "cancelled"],
      default: "in_progress",
    },

    // ─── MODULE A: Conversation History ───────────────────────────
    conversation: [
      {
        role: { type: String, enum: ["ai", "patient"] },
        content: String,
        inputMode: { type: String, enum: ["voice", "touch", "text"] },
        timestamp: { type: Date, default: Date.now },
        category: {
          type: String,
          enum: [
            "greeting",
            "chief_complaint",
            "hpi",
            "past_medical",
            "past_surgical",
            "drug_history",
            "allergy",
            "family_history",
            "personal_history",
            "review_of_systems",
            "ayush_assessment",
            "closing",
          ],
        },
      },
    ],

    // Extracted structured clinical history (from conversation)
    clinicalHistory: {
      chiefComplaint: { type: String, default: "" },
      hpiDetails: {
        site: String,
        onset: String,
        character: String,
        radiation: String,
        associatedSymptoms: [String],
        timing: String,
        exacerbatingFactors: [String],
        relievingFactors: [String],
        severity: { type: Number, min: 1, max: 10 },
      },
      pastMedicalHistory: [
        {
          condition: String,
          duration: String,
          currentMedications: [String],
          status: { type: String, enum: ["active", "resolved"] },
        },
      ],
      pastSurgicalHistory: [
        {
          procedure: String,
          year: String,
        },
      ],
      drugHistory: [
        {
          name: String,
          dose: String,
          frequency: String,
          duration: String,
        },
      ],
      allergyHistory: [
        {
          allergen: String,
          reaction: String,
          severity: { type: String, enum: ["mild", "moderate", "severe"] },
        },
      ],
      familyHistory: [
        {
          relation: String,
          condition: String,
        },
      ],
      personalHistory: {
        diet: String,
        sleep: String,
        exercise: String,
        smoking: String,
        alcohol: String,
        occupation: String,
      },
      reviewOfSystems: {
        cardiovascular: [String],
        respiratory: [String],
        gastrointestinal: [String],
        neurological: [String],
        musculoskeletal: [String],
        genitourinary: [String],
        dermatological: [String],
        endocrine: [String],
      },
    },

    // ─── AYUSH Assessment (Dashavidha Pariksha) ───────────────────
    ayushAssessment: {
      prakriti: {
        type: String,
        enum: [
          "Vata",
          "Pitta",
          "Kapha",
          "Vata-Pitta",
          "Pitta-Kapha",
          "Vata-Kapha",
          "Tridosha",
        ],
      },
      vikriti: String,
      sara: String,
      samhanana: String,
      pramana: String,
      satmya: String,
      sattva: { type: String, enum: ["Pravara", "Madhyama", "Avara"] },
      aharaShakti: String,
      vyayamaShakti: String,
      vaya: String,
      agni: {
        type: String,
        enum: ["Samagni", "Vishamagni", "Teekshnagni", "Mandagni"],
      },
      koshtha: {
        type: String,
        enum: ["Mridu", "Madhyama", "Krura"],
      },
      aharaVihara: {
        diet: String,
        lifestyle: String,
        dailyRoutine: String,
      },
    },

    // ─── MODULE B: Scanned Documents ──────────────────────────────
    scannedDocuments: [
      {
        type: {
          type: String,
          enum: [
            "prescription",
            "lab_report",
            "discharge_summary",
            "imaging",
            "other",
          ],
        },
        imageUrl: String, // Cloudinary URL
        ocrText: String, // Raw OCR output
        extractedData: {
          diagnoses: [String],
          medications: [
            {
              name: String,
              dose: String,
              frequency: String,
            },
          ],
          labResults: [
            {
              test: String,
              value: String,
              unit: String,
              referenceRange: String,
              isAbnormal: Boolean,
            },
          ],
          procedures: [String],
          doctorName: String,
          hospitalName: String,
          date: Date,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── MODULE C: Clinical Summary ───────────────────────────────
    clinicalSummary: {
      generatedText: String, // English doctor-facing summary
      patientSummary: String, // Local language patient-facing summary
      ayushSummary: String,
      redFlags: [String],
      abnormalValues: [
        {
          test: String,
          value: String,
          concern: String,
        },
      ],
      drugInteractions: [String],
      generatedAt: Date,
    },

    // ─── MODULE D: Consent ────────────────────────────────────────
    consent: {
      dataCollectionConsent: { type: Boolean, default: false },
      dataSharingConsent: { type: Boolean, default: false },
      abhaLinkingConsent: { type: Boolean, default: false },
      consentTimestamp: Date,
      consentMethod: { type: String, enum: ["voice", "touch"] },
    },

    // ─── Doctor Review ────────────────────────────────────────────
    doctorReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
      reviewedAt: Date,
      status: {
        type: String,
        enum: ["accepted", "modified", "rejected"],
      },
      modifications: String,
    },

    // ─── Digital Prescription ─────────────────────────────────────
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },

    // ─── Appointment ─────────────────────────────────────────────
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // Conversation AI state tracking
    completionPercentage: { type: Number, default: 0 },
    currentCategory: { type: String, default: "greeting" },

    completedAt: Date,
    expiresAt: Date, // Session auto-delete for privacy
  },
  {
    timestamps: true,
  },
);

// Index for quick lookups
sessionSchema.index({ patient: 1, createdAt: -1 });
sessionSchema.index({ status: 1 });

// TTL index — MongoDB automatically deletes sessions after expiresAt
// This ensures patient data is not stored indefinitely (DPDP Act compliance)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
