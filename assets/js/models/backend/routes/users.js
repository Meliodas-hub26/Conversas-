import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* Middleware de autenticação */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Não autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

/* GET perfil */
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

/* PATCH editar perfil */
router.patch("/me", authMiddleware, async (req, res) => {
  const { username, bio, avatar } = req.body;

  const user = await User.findById(req.userId);

  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;

  await user.save();
  res.json(user);
});

export default router;
