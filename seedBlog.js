import mongoose from "mongoose";
import Blog from "./models/blog.js";
import connectDB from "./db/config.js";

const blogPosts = [
  {
    title: "Creating Visual Meditation for Inner Peace",
    description:
      "In a world that moves too fast, mandalas whisper the language of stillness sacred circles that mirror the soul. Their intricate patterns invite us to pause, breathe, and journey inward. Each curve and color becomes a doorway to peace, each line a pathway to divine connection. The Power of Mandalas Mandalas, with their geometric harmony, are more than just art — they are spiritual maps guiding us back to our center. Every color, shape, and symbol holds meaning. Blue speaks of serenity, gold of divine wisdom, green of healing, and red of vitality. Begin your journey by exploring the symbolism of these shapes and hues. Allow your intuition to choose what feels aligned with your intention — whether it's healing, love, clarity, or manifestation. You can draw your own mandala using colored pencils, markers, or digital tools, letting your hand move freely with your inner rhythm. As you create, breathe gently. With each stroke, infuse your mandala with your energy — your hopes, your peace, your prayers. Let the process itself become meditation. If you prefer, gaze upon a pre-made mandala during your meditation. Let its patterns pull your awareness inward, quieting thoughts and awakening calm. Mandalas are a visual language of the soul — a sacred mirror reflecting your inner harmony.",
    image: "/images/withcandle.png",
    category: "Meditation & Mindfulness",
    author: "Ananya Sharma",
    authorInitials: "AS",
    date: "Dec 22, 2024",
    comments: 18,
    views: 945,
  },
  {
    title: "Connecting with Nature Spirits for Guidance",
    description:
      "Step into an ancient forest, where sunlight filters through emerald leaves and the air hums with unseen magic. This is the realm of nature spirits — guardians of trees, waters, and wild meadows. For centuries, mystics and healers have honored these gentle beings, knowing their presence brings guidance, healing, and harmony. To connect with them, begin by slowing down. Breathe with the rhythm of the earth. Notice the whisper of the wind through branches, the melody of a bird's song, or the sacred scent of damp soil after rain. In these subtle signs, the spirits speak. Offer a small gesture of respect — a song, a poem, a crystal, or a simple stone from your heart. Then sit in stillness. Let your senses open beyond sight and sound. Listen not with your ears, but with your spirit. You may feel a wave of peace, a shimmer of energy, or a vision flickering within your mind's eye — gentle messages from the unseen realms. These are the ways nature spirits communicate — through feelings, intuition, and the quiet language of harmony. Their wisdom flows softly, reminding us that connection is built on love, humility, and reverence. Each tree carries its own soul. The steadfast oak offers grounding and ancient strength. The graceful birch embodies renewal and resilience. The willow teaches emotional flow, while the pine holds cleansing light. As you walk through forests and fields, feel how the energy changes — the way a sunlit clearing hums differently than a shaded grove, or how a flowing stream carries songs of release and renewal. By honoring and listening, you awaken to the truth: the wildwood is alive, conscious, and deeply aware. Every rustling leaf, every dancing shadow speaks the language of balance and belonging. To connect with nature spirits is to remember that you are not separate from nature — you are part of her breath, her rhythm, her eternal song.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop",
    category: "Nature Spirituality",
    author: "Rohan Wilde",
    authorInitials: "RW",
    date: "Dec 18, 2024",
    comments: 22,
    views: 1103,
  },
];

const seedBlogs = async () => {
  try {
    await connectDB();
    await Blog.deleteMany();
    await Blog.insertMany(blogPosts);
    console.log("Blog data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding blog data:", error);
    process.exit(1);
  }
};

seedBlogs();