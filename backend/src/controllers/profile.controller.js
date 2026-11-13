import User from "../models/User.js";

const toUserResponse = (user) => ({
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
});

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -googleId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: toUserResponse(user) });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, age, height, weight, fitnessGoal } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
        return res.status(400).json({ success: false, message: "Name must contain 2 to 80 characters" });
      }
      updates.name = name.trim();
    }

    const numericFields = [
      { key: "age", value: age, min: 1, max: 120 },
      { key: "height", value: height, min: 50, max: 250 },
      { key: "weight", value: weight, min: 20, max: 300 },
    ];

    for (const field of numericFields) {
      if (field.value === undefined) continue;
      const value = Number(field.value);
      if (!Number.isFinite(value) || value < field.min || value > field.max) {
        return res.status(400).json({
          success: false,
          message: `${field.key} must be between ${field.min} and ${field.max}`,
        });
      }
      updates[field.key] = value;
    }

    const allowedGoals = [
      "general-fitness",
      "muscle-gain",
      "fat-loss",
      "performance",
      "recovery",
    ];

    if (fitnessGoal !== undefined) {
      if (!allowedGoals.includes(fitnessGoal)) {
        return res.status(400).json({ success: false, message: "Invalid fitness goal" });
      }
      updates.fitnessGoal = fitnessGoal;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid profile fields provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).select("-password -googleId");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update profile" });
  }
};
