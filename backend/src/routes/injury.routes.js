import express from "express";

import {
  createAssessment,
  createAIAssessment,
  getLatestAssessment,
} from "../controllers/injury.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/latest",
  authMiddleware,
  getLatestAssessment
);

router.post(
  "/assessment",
  authMiddleware,
  createAssessment
);

router.post(
  "/ai-assessment",
  authMiddleware,
  createAIAssessment
);

export default router;