import InjuryAssessment from "../models/InjuryAssessment.js";

// ==========================================
// CALCULATE MANUAL INJURY RISK
// ==========================================

const calculateRisk = ({
  trainingFrequency,
  trainingLoad,
  previousInjury,
  currentPain,
  sleepQuality,
  recoveryQuality,
}) => {
  let score = 0;

  // Training frequency
  if (trainingFrequency >= 7) {
    score += 15;
  } else if (trainingFrequency >= 5) {
    score += 10;
  } else if (trainingFrequency >= 3) {
    score += 5;
  }

  // Training load
  score += trainingLoad * 3;

  // Previous injury
  if (previousInjury) {
    score += 15;
  }

  // Current pain
  score += currentPain * 4;

  // Sleep quality
  score += (10 - sleepQuality) * 2;

  // Recovery quality
  score += (10 - recoveryQuality) * 2;

  // Keep score between 0 and 100
  score = Math.round(
    Math.min(Math.max(score, 0), 100)
  );

  let riskLevel = "Low";

  if (score > 60) {
    riskLevel = "High";
  } else if (score > 30) {
    riskLevel = "Moderate";
  }

  return {
    score,
    riskLevel,
  };
};

// ==========================================
// GENERATE MANUAL RECOMMENDATIONS
// ==========================================

const generateRecommendations = ({
  riskLevel,
  currentPain,
  sleepQuality,
  recoveryQuality,
  trainingLoad,
  previousInjury,
}) => {
  const recommendations = [];

  if (currentPain >= 5) {
    recommendations.push(
      "Consider reducing training intensity and assessing the source of your pain."
    );
  }

  if (sleepQuality < 6) {
    recommendations.push(
      "Prioritize consistent sleep and recovery."
    );
  }

  if (recoveryQuality < 6) {
    recommendations.push(
      "Add recovery sessions and allow adequate rest between intense workouts."
    );
  }

  if (trainingLoad >= 8) {
    recommendations.push(
      "Consider reducing training load to avoid excessive fatigue."
    );
  }

  if (previousInjury) {
    recommendations.push(
      "Pay extra attention to previously injured areas during training."
    );
  }

  if (recommendations.length === 0) {
    if (riskLevel === "Low") {
      recommendations.push(
        "Your current indicators look good. Continue your balanced training and recovery routine."
      );
    } else {
      recommendations.push(
        "Monitor your training load and recovery closely."
      );
    }
  }

  return recommendations;
};

// ==========================================
// CREATE MANUAL ASSESSMENT
// ==========================================

export const createAssessment = async (req, res) => {
  try {
    const {
      trainingFrequency,
      trainingLoad,
      previousInjury,
      currentPain,
      sleepQuality,
      recoveryQuality,
    } = req.body;

    // Validate required fields
    if (
      trainingFrequency === undefined ||
      trainingLoad === undefined ||
      currentPain === undefined ||
      sleepQuality === undefined ||
      recoveryQuality === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All assessment fields are required",
      });
    }

    // Convert values to numbers
    const frequency = Number(trainingFrequency);
    const load = Number(trainingLoad);
    const pain = Number(currentPain);
    const sleep = Number(sleepQuality);
    const recovery = Number(recoveryQuality);

    const hasPreviousInjury = Boolean(previousInjury);

    // Calculate risk
    const result = calculateRisk({
      trainingFrequency: frequency,
      trainingLoad: load,
      previousInjury: hasPreviousInjury,
      currentPain: pain,
      sleepQuality: sleep,
      recoveryQuality: recovery,
    });

    // Generate recommendations
    const recommendations = generateRecommendations({
      riskLevel: result.riskLevel,
      currentPain: pain,
      sleepQuality: sleep,
      recoveryQuality: recovery,
      trainingLoad: load,
      previousInjury: hasPreviousInjury,
    });

    // Save assessment
    const assessment = await InjuryAssessment.create({
      user: req.user.id,

      assessmentType: "manual",

      trainingFrequency: frequency,
      trainingLoad: load,
      previousInjury: hasPreviousInjury,
      currentPain: pain,
      sleepQuality: sleep,
      recoveryQuality: recovery,

      riskScore: result.score,
      riskLevel: result.riskLevel,

      recommendations,
    });

    return res.status(201).json({
      success: true,
      message: "Injury assessment completed",
      assessment,
    });
  } catch (error) {
    console.error(
      "CREATE INJURY ASSESSMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create injury assessment",
    });
  }
};

// ==========================================
// GET LATEST ASSESSMENT
// ==========================================

export const getLatestAssessment = async (req, res) => {
  try {
    const assessment = await InjuryAssessment.findOne({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error(
      "GET INJURY ASSESSMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load injury assessment",
    });
  }
};

// ==========================================
// CREATE AI INJURY ASSESSMENT
// ==========================================

export const createAIAssessment = async (req, res) => {
  try {
    const {
      risk,
      riskLevel,
      warnings,
      feedback,
      recommendation,
      angles,
      metrics,
    } = req.body;

    // ==========================================
    // VALIDATE AI RISK
    // ==========================================

    if (typeof risk !== "number") {
      return res.status(400).json({
        success: false,
        message: "AI risk score is required",
      });
    }

    // Keep risk between 0 and 100
    const riskScore = Math.round(
      Math.min(Math.max(risk, 0), 100)
    );

    // ==========================================
    // NORMALIZE RISK LEVEL
    // ==========================================

    let normalizedRiskLevel = "Low";

    if (
      typeof riskLevel === "string" &&
      riskLevel.toLowerCase() === "high"
    ) {
      normalizedRiskLevel = "High";
    } else if (
      typeof riskLevel === "string" &&
      riskLevel.toLowerCase() === "moderate"
    ) {
      normalizedRiskLevel = "Moderate";
    }

    // ==========================================
    // NORMALIZE WARNINGS
    // ==========================================

    const normalizedWarnings = Array.isArray(warnings)
      ? warnings.filter(
          (warning) => typeof warning === "string"
        )
      : [];

    // ==========================================
    // NORMALIZE FEEDBACK
    // ==========================================

    const normalizedFeedback =
      typeof feedback === "string"
        ? feedback
        : "";

    // ==========================================
    // NORMALIZE RECOMMENDATION
    // ==========================================

    const normalizedRecommendation =
      typeof recommendation === "string"
        ? recommendation
        : "";

    // ==========================================
    // SAVE AI ASSESSMENT
    // ==========================================

    const assessment = await InjuryAssessment.create({
      user: req.user.id,

      assessmentType: "ai",

      riskScore,

      riskLevel: normalizedRiskLevel,

      recommendations:
        normalizedRecommendation
          ? [normalizedRecommendation]
          : [],

      aiData: {
        feedback: normalizedFeedback,

        warnings: normalizedWarnings,

        recommendation:
          normalizedRecommendation,

        angles:
          angles && typeof angles === "object"
            ? angles
            : {},

        metrics:
          metrics && typeof metrics === "object"
            ? metrics
            : {},
      },
    });

    return res.status(201).json({
      success: true,
      message: "AI injury assessment saved",
      assessment,
    });
  } catch (error) {
    console.error(
      "CREATE AI INJURY ASSESSMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save AI injury assessment",
    });
  }
};