import mongoose from "mongoose";

const injuryAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==============================
    // ASSESSMENT TYPE
    // ==============================
    assessmentType: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
      index: true,
    },

    // ==============================
    // MANUAL ASSESSMENT DATA
    // ==============================
    trainingFrequency: {
      type: Number,
      min: 0,
      max: 14,
    },

    trainingLoad: {
      type: Number,
      min: 0,
      max: 10,
    },

    previousInjury: {
      type: Boolean,
      default: false,
    },

    currentPain: {
      type: Number,
      min: 0,
      max: 10,
    },

    sleepQuality: {
      type: Number,
      min: 0,
      max: 10,
    },

    recoveryQuality: {
      type: Number,
      min: 0,
      max: 10,
    },

    // ==============================
    // COMMON RISK RESULT
    // ==============================
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "WAITING"],
      required: true,
    },

    recommendations: {
      type: [String],
      default: [],
    },

    // ==============================
    // AI POSE DATA
    // ==============================
    aiData: {
      feedback: {
        type: String,
        default: "",
      },

      warnings: {
        type: [String],
        default: [],
      },

      recommendation: {
        type: String,
        default: "",
      },

      angles: {
        left_elbow: Number,
        right_elbow: Number,
        left_knee: Number,
        right_knee: Number,
        left_hip: Number,
        right_hip: Number,
        trunk_lean: Number,
      },

      metrics: {
        left_knee_angle: Number,
        right_knee_angle: Number,
        left_hip_angle: Number,
        right_hip_angle: Number,
        trunk_lean: Number,
        visibility: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const InjuryAssessment = mongoose.model(
  "InjuryAssessment",
  injuryAssessmentSchema
);

export default InjuryAssessment;