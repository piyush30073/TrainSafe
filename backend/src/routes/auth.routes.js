import express from "express";

import {
  register,
  login,
  googleLogin,
  completeGoogleProfile,
} from "../controllers/auth.controller.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/profile.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);

router.put(
  "/google/profile",
  authMiddleware,
  completeGoogleProfile
);

export default router;
