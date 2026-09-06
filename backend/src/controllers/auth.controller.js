import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

// ==========================================
// GOOGLE CLIENT
// ==========================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// USER RESPONSE
// ==========================================

const getUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    height: user.height,
    weight: user.weight,
    fitnessGoal: user.fitnessGoal,
    authProvider: user.authProvider,
    profilePicture: user.profilePicture || "",
    profileComplete:
      user.age !== null &&
      user.height !== null &&
      user.weight !== null,
  };
};

// ==========================================
// REGISTER
// ==========================================

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      height,
      weight,
      fitnessGoal,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      age === undefined ||
      height === undefined ||
      weight === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const numericAge = Number(age);
    const numericHeight = Number(height);
    const numericWeight = Number(weight);

    if (
      !Number.isFinite(numericAge) ||
      !Number.isFinite(numericHeight) ||
      !Number.isFinite(numericWeight)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Age, height and weight must be valid numbers",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      age: numericAge,
      height: numericHeight,
      weight: numericWeight,
      fitnessGoal:
        fitnessGoal || "general-fitness",
      authProvider: "local",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // Google-only accounts don't have a password.
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token = generateToken(
      user._id
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login",
    });
  }
};

// ==========================================
// GOOGLE LOGIN
// ==========================================

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error(
        "GOOGLE_CLIENT_ID is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Google authentication is not configured on the server",
      });
    }

    // Verify the Google ID token on the server.
    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential",
      });
    }

    const {
      sub,
      email,
      email_verified,
      name,
      picture,
    } = payload;

    if (!sub || !email) {
      return res.status(401).json({
        success: false,
        message:
          "Google account information is incomplete",
      });
    }

    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message:
          "Google email is not verified",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // First try to find the account by Google ID.
    let user = await User.findOne({
      googleId: sub,
    });

    // If not found, check whether the email already
    // belongs to a TrainSafe account.
    if (!user) {
      user = await User.findOne({
        email: normalizedEmail,
      });
    }

    if (user) {
      // Existing account:
      // Link Google to it instead of creating a duplicate.
      if (!user.googleId) {
        user.googleId = sub;
      }

      user.authProvider = "google";

      if (name && !user.name) {
        user.name = name;
      }

      if (picture) {
        user.profilePicture = picture;
      }

      await user.save();
    } else {
      // New Google account.
      user = await User.create({
        name: name?.trim() || "TrainSafe User",
        email: normalizedEmail,
        password: null,
        googleId: sub,
        authProvider: "google",
        profilePicture: picture || "",
        age: null,
        height: null,
        weight: null,
        fitnessGoal: "general-fitness",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Google authentication failed",
    });
  }

};
// ==========================================
// COMPLETE GOOGLE PROFILE
// ==========================================

export const completeGoogleProfile = async (req, res) => {
  try {
    const {
      age,
      height,
      weight,
      fitnessGoal,
    } = req.body;

    if (
      age === undefined ||
      height === undefined ||
      weight === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Age, height and weight are required",
      });
    }

    const numericAge = Number(age);
    const numericHeight = Number(height);
    const numericWeight = Number(weight);

    if (
      !Number.isFinite(numericAge) ||
      !Number.isFinite(numericHeight) ||
      !Number.isFinite(numericWeight)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Age, height and weight must be valid numbers",
      });
    }

    if (
      numericAge < 1 ||
      numericAge > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be between 1 and 120",
      });
    }

    if (
      numericHeight < 50 ||
      numericHeight > 250
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Height must be between 50 and 250 cm",
      });
    }

    if (
      numericWeight < 20 ||
      numericWeight > 300
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Weight must be between 20 and 300 kg",
      });
    }

   const user = await User.findById(
  req.user.id
);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.age = numericAge;
    user.height = numericHeight;
    user.weight = numericWeight;
    user.fitnessGoal =
      fitnessGoal || "general-fitness";

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        "Athlete profile completed successfully",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "COMPLETE GOOGLE PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete athlete profile",
    });
  }
};