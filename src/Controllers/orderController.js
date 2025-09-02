import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js"; // ✅ import Product model

// Create new order (user)
const createOrder = asyncHandler(async (req, res) => {
  const { items, total, city, paymentMethod, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Populate each item with name, image, price
  const detailedItems = await Promise.all(
    items.map(async (i) => {
      const product = await Product.findById(i.product);
      if (!product) throw new Error("Product not found");
      return {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        qty: i.qty,
      };
    })
  );

  const order = await Order.create({
    items: detailedItems,  // ✅ save detailed items
    total,
    city,
    paymentMethod,
    shippingAddress,
    user: req.user?._id || null,
  });

  res.status(201).json(order);
});

// Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // ✅ user info
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Failed to get orders:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// Update order status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status || order.status;
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

export { createOrder, getAllOrders, updateOrderStatus };
