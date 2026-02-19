import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// --- NEW: Bridge for Android App ---
export async function syncFirebaseUser(req, res) {
  const { email, fullName, firebaseId, password } = req.body;

  try {
    if (!email || !fullName || !firebaseId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists in MongoDB via Firebase ID or Email
    let user = await User.findOne({
      $or: [{ firebaseId }, { email }]
    });

    if (!user) {
      const idx = Math.floor(Math.random() * 100) + 1;
      const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

      // Create MERN user linked to Firebase
      user = await User.create({
        email,
        fullName,
        firebaseId,
        password,
        dateOfBirth: req.body.dateOfBirth || new Date("2000-01-01"),
        profilePic: randomAvatar,
      });

      // Keep Stream integration working
      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullName,
          image: user.profilePic || "",
        });
      } catch (error) {
        console.log("Error syncing Stream user:", error);
      }
    }

    // Generate JWT so the Android app can make authorized MERN calls
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    console.log("Error in firebase sync controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function signup(req, res) {
  const { email, password, fullName, dateOfBirth } = req.body;

  try {
    if (!email || !password || !fullName || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Age verification: must be 18+
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({ message: "You must be at least 18 years old to sign up" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      dateOfBirth: dob,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...req.body, isOnboarded: true },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}