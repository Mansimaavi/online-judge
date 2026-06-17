import User from "../models/user.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({ username, firstName, lastName, email, password }) => {
  if (!username || !firstName || !lastName || !email || !password) {
    throw { status: 400, message: "All fields are required" };
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw { status: 409, message: "Username already taken" };
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw { status: 409, message: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await User.create({
    username: username.toLowerCase(),
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    user: {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async ({ username, password }) => {
  if (!username || !password) {
    throw { status: 400, message: "Enter both username and password" };
  }

  // Find user by username
  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { status: 401, message: "Invalid username or password" };
  }

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    user: {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
};