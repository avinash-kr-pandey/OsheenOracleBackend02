// routes/paymentRoutes.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route 1: Create Razorpay Order
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    console.log("📝 Creating Razorpay order for amount:", amount);

    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create order",
    });
  }
});

// Route 2: Verify Payment
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("🔍 Verifying payment for order:", razorpay_order_id);

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log("✅ Payment verified successfully");

      // Here you can update your database
      // For example: Update order status, save payment details, etc.

      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      console.error("❌ Invalid payment signature");
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
});

// Optional: Route to get payment status
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
