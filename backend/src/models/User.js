import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Required for normal email/password accounts.
    // Google-only accounts don't have a password.
    password: {
      type: String,
      minlength: 6,
      default: null,
    },

    // Google account information
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    // TrainSafe profile information.
    // These are optional at database level because a new
    // Google user may need to complete their profile first.
    age: {
      type: Number,
      min: 1,
      max: 120,
      default: null,
    },

    height: {
      type: Number,
      min: 50,
      max: 250,
      default: null,
    },

    weight: {
      type: Number,
      min: 20,
      max: 300,
      default: null,
    },

    fitnessGoal: {
      type: String,
      enum: [
        "general-fitness",
        "muscle-gain",
        "fat-loss",
        "performance",
        "recovery",
      ],
      default: "general-fitness",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;