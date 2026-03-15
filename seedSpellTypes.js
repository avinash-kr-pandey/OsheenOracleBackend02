import mongoose from "mongoose";
import dotenv from "dotenv";
import SpellType from "../models/spellType.js";
import connectDB from "../db/config.js";

dotenv.config();
connectDB();

const seedData = [
  {
    type: "Love Spells",
    description:
      "These spells focus on attracting, healing, or strengthening love. Whether you're calling in a soulmate, rekindling a lost connection, or deepening self-love — love spells work through the heart chakra to align you with divine love.",
    idealFor:
      "Soulmate attraction, bringing back an ex, relationship healing, or self-love activation.",
    icon: "💖",
  },
  {
    type: "Money & Abundance Spells",
    description:
      "These spells open the flow of wealth, success, and opportunity. They clear energetic blocks around money and align you with the frequency of abundance.",
    idealFor:
      "Job success, business growth, attracting clients, or manifesting wealth.",
    icon: "💰",
  },
  {
    type: "Protection Spells",
    description:
      "Designed to shield you from negativity, evil eye, jealousy, psychic attacks, or toxic people. Protection spells strengthen your aura and create a safe, high-vibe space around you.",
    idealFor:
      "Energy cleansing, removing negative influences, or setting strong spiritual boundaries.",
    icon: "🛡️",
  },
  {
    type: "Healing Spells",
    description:
      "Healing spells support emotional and spiritual recovery. They're often used after heartbreak, trauma, grief, or spiritual imbalance — helping you release pain and reconnect with inner peace.",
    idealFor:
      "Inner healing, emotional release, self-worth restoration, or chakra alignment.",
    icon: "🌿",
  },
  {
    type: "Manifestation Spells",
    description:
      "These are all about turning your desires into reality. Manifestation spells supercharge your intentions with energy, helping you attract what you truly want — whether it's love, a dream home, career success, or personal goals.",
    idealFor:
      "New moon rituals, life transitions, dream-building, or personal growth.",
    icon: "✨",
  },
  {
    type: "Banishing Spells",
    description:
      "When something (or someone) is blocking your growth, banishing spells help you remove it. These rituals are used to cut cords, break toxic cycles, and release unwanted energy.",
    idealFor:
      "Releasing toxic relationships, ending karmic ties, breaking habits, or clearing spiritual blocks.",
    icon: "🔥",
  },
  {
    type: "Success & Career Spells",
    description:
      "These spells are crafted to boost motivation, open career paths, and invite recognition or promotion. They're powerful for anyone feeling stuck or ready for their next level.",
    idealFor:
      "Career advancement, business success, creative breakthroughs, or professional recognition.",
    icon: "📈",
  },
];

const seedSpellTypes = async () => {
  try {
    await SpellType.deleteMany(); // Clear existing data
    await SpellType.insertMany(seedData);
    console.log("Spell types seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedSpellTypes();