import express from "express";

import {
  register,
  login,
  googleLogin,
  completeGoogleProfile,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.put(
  "/google/profile",
  authMiddleware,
  completeGoogleProfile
);

export default router;