import express from "express";
import { register, login, logout, getCurrentUser, getUserCount } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getCurrentUser);
router.get("/count", getUserCount);

export default router;
