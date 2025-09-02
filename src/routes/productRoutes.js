import express from "express";
import asyncHandler from "express-async-handler";
import { protect, adminOnly } from "../middleware/auth.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, min, max } = req.query;
    const filter = {};
    if (q) filter.name = new RegExp(q, "i");
    if (category) filter.category = category;
    if (min || max) {
      filter.price = {
        ...(min ? { $gte: Number(min) } : {}),
        ...(max ? { $lte: Number(max) } : {}),
      };
    }
    const products = await Product.find(filter)
      .populate("categoryRef")
      .sort({ createdAt: -1 });
    res.json(products);
  })
);

// GET product by id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const p = await Product.findById(req.params.id).populate("categoryRef");
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  })
);

// CREATE product (admin only)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (!data.categoryRef) delete data.categoryRef; // 🚀 ignore empty
    const p = await Product.create(data);
    res.status(201).json(p);
  })
);


router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(p);
  })
);

// DELETE product (admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  })
);

export default router;
