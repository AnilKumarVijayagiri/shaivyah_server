// routes/userOrderRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import UserOrder from "../models/UserOrder.js";

const router = express.Router();

// Get logged-in user's orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await UserOrder.find({ user: req.user.id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
