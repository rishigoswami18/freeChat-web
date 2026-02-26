import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firebaseId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows nulls for now during migration
  },
  password: {
    type: String,
    minlength: 6
  },
  dateOfBirth: {
    type: Date,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  nativeLanguage: {
    type: String,
    default: "",
  },
  learningLanguage: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Couple profile fields
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  coupleStatus: {
    type: String,
    enum: ["none", "pending", "coupled"],
    default: "none",
  },
  anniversary: {
    type: Date,
    default: null,
  },
  coupleRequestSenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // Membership fields
  isMember: {
    type: Boolean,
    default: false,
  },
  memberSince: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Stealth Mode fields
  isStealthMode: {
    type: Boolean,
    default: false,
  },
  panicShortcut: {
    type: String,
    default: "Escape",
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  // Gamification fields
  streak: {
    type: Number,
    default: 0,
  },
  lastLoginDate: {
    type: Date,
    default: null,
  },
  badges: {
    type: [String],
    default: [],
  },
}
  , { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;