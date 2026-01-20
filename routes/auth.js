import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hash });
  await user.save();
  res.status(201).json({ message: "Conta criada" });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

export default router;
