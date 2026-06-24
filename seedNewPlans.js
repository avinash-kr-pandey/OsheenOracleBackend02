import mongoose from "mongoose";
import dotenv from "dotenv";
import { MembershipPlan, Benefit, AddOn } from "./models/becomeamember.js";

dotenv.config();

const newPlans = [
  {
    id: "basic-aura",
    name: "Basic Aura Subscription",
    price: "₹2,100",
    period: "month",
    features: [
      "1 Tarot Guidance Session/month (voice note)",
      "1 chakra scanning",
      "Access to voice note healing session with Osheen maam",
      "1 prediction (1 question)",
      "1 Affirmation Sheet",
      "Priority WhatsApp replies within 3 days",
    ],
    popular: false,
    isActive: true,
    order: 1,
  },
  {
    id: "tarot-insight",
    name: "Tarot Insight Subscription",
    price: "₹4,200",
    period: "month",
    features: [
      "2 Full Tarot Readings/month (30 mins each)",
      "2 Quick Doubt Tarot Checks/month",
      "1 Decision Guidance Session/month (voice note)",
      "Access to 'Members Only' monthly prediction",
      "Priority WhatsApp support (reply within 48 hours)",
    ],
    popular: true,
    isActive: true,
    order: 2,
  },
  {
    id: "healing-energy",
    name: "Healing & Energy Subscription",
    price: "₹6,300",
    period: "month",
    features: [
      "2 Energy Healings/month (Reiki/Chakra/Angel healing)",
      "2 Aura Scan Reports/month",
      "1 ritual/month",
      "1 Guided Meditation/month",
      "Monthly Readings (voice note)",
      "WhatsApp priority: replies within 24 hrs",
      "Astrological kundali analysis",
    ],
    popular: false,
    isActive: true,
    order: 3,
  },
  {
    id: "premium-manifestation",
    name: "Premium Manifestation & Ritual Subscription",
    price: "₹10,500",
    period: "month",
    features: [
      "1 Major Ritual Every Month (Money / Protection / Love / Success)",
      "2 Tarot Readings/month",
      "Unlimited tarot doubts (text-based)",
      "2 Healings/month",
      "Full Aura Scan & Report every month",
      "Personal Manifestation Roadmap",
      "WhatsApp VIP lane replies within 12 hours",
      "Call support: 1 priority call/month",
      "Monthly personalised affirmations & scripting guidance",
      "Full Astrology kundali analysis",
      "Monthly Astrological Rituals and totkas",
    ],
    popular: false,
    isActive: true,
    order: 4,
  },
];

const newBenefits = [
  { icon: "🔮", title: "Spiritual Guidance", description: "Tarot, prediction and moon guidance.", isActive: true, order: 1 },
  { icon: "✨", title: "Energy Healing", description: "Reiki, Aura scanning and Chakra alignment.", isActive: true, order: 2 },
  { icon: "📿", title: "Sacred Rituals", description: "Monthly manifestation, Protection and Kundali analysis.", isActive: true, order: 3 },
];

const newAddOns = [
  { service: "Extra Tarot Session", price: "₹2,100", description: "Additional deep-dive tarot guidance session", isActive: true, order: 1 },
  { service: "Extra Healing Session", price: "₹5,100", description: "Additional remote reiki & sound healing session", isActive: true, order: 2 },
  { service: "Urgent Reading (within 30 minutes)", price: "₹21,000", description: "Priority emergency reading delivered in 30 mins", isActive: true, order: 3 },
  { service: "Manifestation Coaching (weekly)", price: "₹11,000", description: "Weekly 1-on-1 coaching for manifestation guidance", isActive: true, order: 4 },
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    console.log("Replacing membership plans...");
    await MembershipPlan.deleteMany({});
    await MembershipPlan.insertMany(newPlans);
    console.log("Membership plans updated.");

    console.log("Replacing benefits...");
    await Benefit.deleteMany({});
    await Benefit.insertMany(newBenefits);
    console.log("Benefits updated.");

    console.log("Replacing add-ons...");
    await AddOn.deleteMany({});
    await AddOn.insertMany(newAddOns);
    console.log("Add-ons updated.");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
