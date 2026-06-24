import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret length:", process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : 0);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const options = {
  amount: 3752 * 100, // in paise
  currency: "INR",
  receipt: `test_receipt_${Date.now()}`,
};

console.log("Calling razorpay.orders.create with options:", options);

razorpay.orders.create(options)
  .then(order => {
    console.log("✅ Success! Order created:", order);
  })
  .catch(error => {
    console.error("❌ Razorpay Error Details:");
    if (error.statusCode) {
      console.error("Status Code:", error.statusCode);
      console.error("Error Response Body:", JSON.stringify(error.error || error, null, 2));
    } else {
      console.error(error);
    }
  });
