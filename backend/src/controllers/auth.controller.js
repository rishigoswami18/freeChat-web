import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUniqueUsername } from "../utils/usernameUtils.js";
import { OAuth2Client } from "google-auth-library";
import OTP from "../models/OTP.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../lib/email.service.js";

const throwawayDomains = [
  "yopmail.com", "mailinator.com", "guerrillamail.com", "temp-mail.org",
  "10minutemail.com", "dispostable.com", "getnada.com", "sharklasers.com",
  "protonmail.ch", "tutanota.com", "dropmail.me"
];

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Google OAuth Sign-In (ID Token method) ---
export async function googleLogin(req, res) {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    // Check if user already exists (by googleId or email)
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      // Create a new user
      const username = await generateUniqueUsername(name);

      user = await User.create({
        email,
        fullName: name,
        username,
        googleId,
        profilePic: picture || `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}.png`,
        dateOfBirth: new Date("2000-01-01"),
        streak: 1,
        lastLoginDate: new Date(),
      });

      // Sync with Stream
      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullName,
          image: user.profilePic || "",
        });
      } catch (error) {
        console.log("Error syncing Stream user (Google):", error);
      }
    } else {
      // Link googleId if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      // Update profile picture from Google if user doesn't have one
      if (!user.profilePic || user.profilePic.includes("avatar.iran.liara.run")) {
        user.profilePic = picture || user.profilePic;
      }

      // --- Streak Logic ---
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      if (!user.lastLoginDate) {
        user.streak = 1;
      } else {
        const lastLogin = new Date(user.lastLoginDate);
        const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
        const diffDays = (today - lastLoginDay) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }
      user.lastLoginDate = now;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in Google login controller:", error.message);
    if (error.message?.includes("Token used too late") || error.message?.includes("Invalid token")) {
      return res.status(401).json({ message: "Google token expired or invalid. Please try again." });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// --- Google OAuth Sign-In (Access Token method — reliable popup flow) ---
export async function googleLoginWithAccessToken(req, res) {
  const { accessToken } = req.body;

  try {
    if (!accessToken) {
      return res.status(400).json({ message: "Google access token is required" });
    }

    // Fetch user info from Google using the access token
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return res.status(401).json({ message: "Invalid Google access token" });
    }

    const { sub: googleId, email, name, picture } = await response.json();

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    // Check if user already exists (by googleId or email)
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      const username = await generateUniqueUsername(name);

      user = await User.create({
        email,
        fullName: name,
        username,
        googleId,
        profilePic: picture || `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}.png`,
        dateOfBirth: new Date("2000-01-01"),
        streak: 1,
        lastLoginDate: new Date(),
      });

      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullName,
          image: user.profilePic || "",
        });
      } catch (error) {
        console.log("Error syncing Stream user (Google):", error);
      }
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.profilePic || user.profilePic.includes("avatar.iran.liara.run")) {
        user.profilePic = picture || user.profilePic;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      if (!user.lastLoginDate) {
        user.streak = 1;
      } else {
        const lastLogin = new Date(user.lastLoginDate);
        const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
        const diffDays = (today - lastLoginDay) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }
      user.lastLoginDate = now;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in Google access token login:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

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

      const username = await generateUniqueUsername(fullName);

      // Create MERN user linked to Firebase
      user = await User.create({
        email,
        fullName,
        username,
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

    // --- Streak Logic ---
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!user.lastLoginDate) {
      user.streak = 1;
    } else {
      const lastLogin = new Date(user.lastLoginDate);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
      const diffDays = (today - lastLoginDay) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    }
    user.lastLoginDate = now;
    await user.save();

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

    // Age verification: move requirement to Couple feature
    const dob = new Date(dateOfBirth);


    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address (e.g., name@example.com)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Throwaway domain check
    const domain = email.split("@")[1];
    if (throwawayDomains.includes(domain.toLowerCase())) {
      return res.status(400).json({ message: "Temporary or throwaway email domains are not allowed." });
    }

    // OTP Verification (optional — allows signup even when email service is down)
    const { otp: userOtp } = req.body;
    if (userOtp) {
      const validOtp = await OTP.findOne({ email, otp: userOtp });
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      // Delete OTP after successful verification
      await OTP.deleteOne({ _id: validOtp._id });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const username = await generateUniqueUsername(fullName);

    const newUser = await User.create({
      email,
      fullName,
      username,
      password,
      dateOfBirth: dob,
      profilePic: randomAvatar,
      streak: 1,
      lastLoginDate: new Date(),
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
      sameSite: "lax",
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
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // --- Streak Logic ---
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!user.lastLoginDate) {
      user.streak = 1;
    } else {
      const lastLogin = new Date(user.lastLoginDate);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
      const diffDays = (today - lastLoginDay) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    }
    user.lastLoginDate = now;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out" });
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

export async function requestOTP(req, res) {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const domain = email.split("@")[1];
    if (throwawayDomains.includes(domain.toLowerCase())) {
      return res.status(400).json({ message: "Temporary email domains are not allowed." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email is already registered" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (overwrite if exists)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Critical: Failed to send OTP email:", emailError);
      return res.status(500).json({
        message: "We're having trouble sending verification emails. Please try again later or contact support.",
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined
      });
    }

    res.status(200).json({ success: true, message: "Verification code sent to your email!" });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json({ message: "An unexpected error occurred. Please try again." });
  }
}
export async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Small security choice: return 200/success even if email doesn't exist
      // to prevent "Email Harvesting", OR return 404. 
      // User experience is better with 404 for a legit app.
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (user.googleId) {
      return res.status(400).json({ message: "This account is linked with Google. Please sign in with Google." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Reset Email
    try {
      await sendResetPasswordEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      return res.status(500).json({ message: "Error sending reset email. Try again later." });
    }

    res.status(200).json({ success: true, message: "Reset code sent to your email!" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update password
    user.password = newPassword;
    await user.save(); // Password hash middleware in User model handles hashing

    // Delete OTP
    await OTP.deleteOne({ _id: validOtp._id });

    res.status(200).json({ success: true, message: "Password updated successfully! You can now log in." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
