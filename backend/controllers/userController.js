import { registerUser, loginUser, getCurrentUser as getUserById } from "../services/userService.js";
import User from '../models/user.js';

export const register = async (req, res) => {
  try {
    const data = await registerUser(req.body);
    res.status(201).json({ success: true, message: "Registration successful", ...data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    res.status(200).cookie("token", data.token, cookieOptions).json({ success: true, message: "Login successful", ...data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user count' });
  }
};
