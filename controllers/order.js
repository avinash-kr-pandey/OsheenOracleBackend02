import Order from "../models/order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { productName, price, status, image } = req.body;

    const newOrder = await order.create({
      user: req.user._id,
      productName,
      price,
      status,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET A SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    await order.deleteOne();

    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
