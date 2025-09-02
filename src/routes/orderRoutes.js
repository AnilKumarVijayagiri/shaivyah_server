import express from "express";
import { createOrder, getAllOrders, updateOrderStatus } from "../Controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder); // user can create order
router.get("/", protect, adminOnly, getAllOrders); // admin only
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
