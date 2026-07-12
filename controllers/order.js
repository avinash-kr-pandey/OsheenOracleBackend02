import Order from "../models/order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { 
      productId, 
      productName, 
      price, 
      quantity,
      totalAmount,
      status, 
      image,
      shippingAddress,
      phone,
      paymentMethod,
      paymentId
    } = req.body;

    const newOrder = await Order.create({
      user: req.user._id,
      productId,
      productName,
      price,
      quantity: quantity || 1,
      totalAmount: totalAmount || (price * (quantity || 1)),
      status: status || "Pending",
      image,
      shippingAddress,
      phone,
      paymentMethod,
      paymentId
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
    const query = req.user.type === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET A SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const query = req.user.type === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(query).populate("user", "name email");

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
    const query = req.user.type === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(query);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (req.body.status !== undefined) order.status = req.body.status;
    if (req.body.trackingId !== undefined) order.trackingId = req.body.trackingId;
    if (req.body.carrier !== undefined) order.carrier = req.body.carrier;
    if (req.body.deliveryDate !== undefined) order.deliveryDate = req.body.deliveryDate;

    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const query = req.user.type === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(query);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    await order.deleteOne();

    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
