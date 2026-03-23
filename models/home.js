import mongoose from "mongoose";

// Catalogue Item Schema (Individual item structure)
const catalogueItemSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
      default: "",
    },
    price: {
      type: String,
      default: "0",
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    date: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    traits: [
      {
        type: String,
      },
    ],
    element: {
      type: String,
      default: "",
    },
    planet: {
      type: String,
      default: "",
    },
    symbol: {
      type: String,
      default: "",
    },
    luckyColor: {
      type: String,
      default: "",
    },
    luckyNumber: {
      type: Number,
      default: 0,
    },
    compatibility: [
      {
        type: String,
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    readingIncludes: [
      {
        type: String,
      },
    ],
    strengths: [
      {
        type: String,
      },
    ],
    challenges: [
      {
        type: String,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

// Main Home Schema
const homeSchema = new mongoose.Schema(
  {
    // 1. Discover Section - Osheen MAA and Osheen Oracle
    discoverSection: {
      osheenMaa: {
        title: {
          type: String,
          default: "Osheen MAA",
        },
        description: {
          type: String,
          default: "Spiritual guidance and healing",
        },
        image: {
          type: String,
          default: "",
        },
        link: {
          type: String,
          default: "/osheen-maa",
        },
      },
      osheenOracle: {
        title: {
          type: String,
          default: "Osheen Oracle",
        },
        description: {
          type: String,
          default: "Ancient wisdom for modern life",
        },
        image: {
          type: String,
          default: "",
        },
        link: {
          type: String,
          default: "/osheen-oracle",
        },
      },
    },

    // 2. Discover Your Path - Multiple cards
    discoverYourPath: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        order: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // 3. Achievements Section
    achievements: {
      title: {
        type: String,
        default: "Our Achievements",
      },
      description: {
        type: String,
        default: "",
      },
      images: [
        {
          url: String,
          caption: String,
          order: Number,
        },
      ],
      stats: {
        yearsOfExperience: {
          type: Number,
          default: 15,
        },
        satisfiedClients: {
          type: Number,
          default: 4200,
        },
        reviews: {
          type: Number,
          default: 892,
        },
        satisfactionRate: {
          type: Number,
          default: 92,
        },
      },
    },

    // 4. Media Spotlight Section
    mediaSpotlight: [
      {
        title: String,
        image: String,
        logo: String,
        link: String,
        order: Number,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // 5. Catalogue Section - Using catalogueItemSchema
    catalogue: [catalogueItemSchema],

    // 6. Meet Your Expert Guides Section
    expertGuides: [
      {
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        rating: {
          type: Number,
          default: 4.8,
        },
        reviews: {
          type: Number,
          default: 892,
        },
        satisfactionRate: {
          type: Number,
          default: 92,
        },
        expertise: {
          type: String,
          default: "",
        },
        experience: {
          type: String,
          default: "15+ years",
        },
        languages: [String],
        expertiseAreas: [String],
        isVerified: {
          type: Boolean,
          default: true,
        },
        stats: {
          professionalExperience: {
            type: String,
            default: "15+ years",
          },
          satisfiedClients: {
            type: String,
            default: "4200+",
          },
        },
        order: Number,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // 7. SEO and Meta
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  },
);

// Singleton pattern to get home data
homeSchema.statics.getHomeData = async function () {
  let homeData = await this.findOne();
  if (!homeData) {
    homeData = await this.create({});
  }
  return homeData;
};

const Home = mongoose.model("Home", homeSchema);
export default Home;
