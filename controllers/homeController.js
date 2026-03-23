import Home from "../models/home.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/home/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "home-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// ============ PUBLIC CONTROLLERS ============
export const getHomeData = async (req, res) => {
  try {
    const homeData = await Home.getHomeData();
    res.status(200).json({
      success: true,
      data: homeData,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching home data",
      error: error.message,
    });
  }
};

// ============ DISCOVER SECTION CONTROLLERS ============
export const updateDiscoverSection = async (req, res) => {
  try {
    const { osheenMaa, osheenOracle } = req.body;
    const homeData = await Home.getHomeData();

    if (osheenMaa) {
      homeData.discoverSection.osheenMaa = {
        ...homeData.discoverSection.osheenMaa,
        ...osheenMaa,
      };
    }
    if (osheenOracle) {
      homeData.discoverSection.osheenOracle = {
        ...homeData.discoverSection.osheenOracle,
        ...osheenOracle,
      };
    }

    await homeData.save();
    res.status(200).json({
      success: true,
      message: "Discover section updated successfully",
      data: homeData.discoverSection,
    });
  } catch (error) {
    console.error("Error updating discover section:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadDiscoverImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { type } = req.body; // 'osheenMaa' or 'osheenOracle'
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      if (type === "osheenMaa") {
        if (homeData.discoverSection.osheenMaa.image) {
          const oldPath = path.join(
            __dirname,
            "..",
            homeData.discoverSection.osheenMaa.image,
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        homeData.discoverSection.osheenMaa.image = imageUrl;
      } else if (type === "osheenOracle") {
        if (homeData.discoverSection.osheenOracle.image) {
          const oldPath = path.join(
            __dirname,
            "..",
            homeData.discoverSection.osheenOracle.image,
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        homeData.discoverSection.osheenOracle.image = imageUrl;
      }

      await homeData.save();
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ============ DISCOVER YOUR PATH CONTROLLERS ============
export const addDiscoverPath = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const homeData = await Home.getHomeData();

    const newPath = {
      title,
      description,
      order: order || homeData.discoverYourPath.length,
      isActive: true,
    };

    homeData.discoverYourPath.push(newPath);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Discover path added successfully",
      data: homeData.discoverYourPath,
    });
  } catch (error) {
    console.error("Error adding discover path:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDiscoverPath = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const homeData = await Home.getHomeData();

    const index = homeData.discoverYourPath.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    homeData.discoverYourPath[index] = {
      ...homeData.discoverYourPath[index].toObject(),
      ...updates,
    };
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Discover path updated successfully",
      data: homeData.discoverYourPath[index],
    });
  } catch (error) {
    console.error("Error updating discover path:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDiscoverPath = async (req, res) => {
  try {
    const { id } = req.params;
    const homeData = await Home.getHomeData();

    const index = homeData.discoverYourPath.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Delete image if exists
    if (homeData.discoverYourPath[index].image) {
      const imagePath = path.join(
        __dirname,
        "..",
        homeData.discoverYourPath[index].image,
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    homeData.discoverYourPath.splice(index, 1);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Discover path deleted successfully",
      data: homeData.discoverYourPath,
    });
  } catch (error) {
    console.error("Error deleting discover path:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDiscoverPathImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { id } = req.body;
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      const index = homeData.discoverYourPath.findIndex(
        (item) => item._id.toString() === id,
      );
      if (index === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      // Delete old image
      if (homeData.discoverYourPath[index].image) {
        const oldPath = path.join(
          __dirname,
          "..",
          homeData.discoverYourPath[index].image,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      homeData.discoverYourPath[index].image = imageUrl;
      await homeData.save();

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ============ ACHIEVEMENTS CONTROLLERS ============
export const updateAchievements = async (req, res) => {
  try {
    const { title, description, stats } = req.body;
    const homeData = await Home.getHomeData();

    if (title) homeData.achievements.title = title;
    if (description) homeData.achievements.description = description;
    if (stats)
      homeData.achievements.stats = {
        ...homeData.achievements.stats,
        ...stats,
      };

    await homeData.save();
    res.status(200).json({
      success: true,
      message: "Achievements updated successfully",
      data: homeData.achievements,
    });
  } catch (error) {
    console.error("Error updating achievements:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAchievementImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { caption } = req.body;
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      homeData.achievements.images.push({
        url: imageUrl,
        caption: caption || "",
        order: homeData.achievements.images.length,
      });

      await homeData.save();
      res.status(200).json({
        success: true,
        message: "Achievement image added successfully",
        data: homeData.achievements.images,
      });
    } catch (error) {
      console.error("Error adding achievement image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const deleteAchievementImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const homeData = await Home.getHomeData();

    const imageIndex = homeData.achievements.images.findIndex(
      (img) => img._id.toString() === imageId,
    );
    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const imagePath = path.join(
      __dirname,
      "..",
      homeData.achievements.images[imageIndex].url,
    );
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    homeData.achievements.images.splice(imageIndex, 1);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Achievement image deleted successfully",
      data: homeData.achievements.images,
    });
  } catch (error) {
    console.error("Error deleting achievement image:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ MEDIA SPOTLIGHT CONTROLLERS ============
export const addMediaSpotlight = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { title, logo, link, order } = req.body;
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      homeData.mediaSpotlight.push({
        title: title || "",
        image: imageUrl,
        logo: logo || "",
        link: link || "",
        order: order || homeData.mediaSpotlight.length,
        isActive: true,
      });

      await homeData.save();
      res.status(200).json({
        success: true,
        message: "Media spotlight added successfully",
        data: homeData.mediaSpotlight,
      });
    } catch (error) {
      console.error("Error adding media spotlight:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const updateMediaSpotlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const homeData = await Home.getHomeData();

    const index = homeData.mediaSpotlight.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    homeData.mediaSpotlight[index] = {
      ...homeData.mediaSpotlight[index].toObject(),
      ...updates,
    };
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Media spotlight updated successfully",
      data: homeData.mediaSpotlight[index],
    });
  } catch (error) {
    console.error("Error updating media spotlight:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMediaSpotlight = async (req, res) => {
  try {
    const { id } = req.params;
    const homeData = await Home.getHomeData();

    const index = homeData.mediaSpotlight.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Delete image
    if (homeData.mediaSpotlight[index].image) {
      const imagePath = path.join(
        __dirname,
        "..",
        homeData.mediaSpotlight[index].image,
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    homeData.mediaSpotlight.splice(index, 1);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Media spotlight deleted successfully",
      data: homeData.mediaSpotlight,
    });
  } catch (error) {
    console.error("Error deleting media spotlight:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ CATALOGUE CONTROLLERS ============
export const addCatalogue = async (req, res) => {
  try {
    const { title, description, details, order } = req.body;
    const homeData = await Home.getHomeData();

    const newCatalogue = {
      title,
      description: description || "",
      details: details ? JSON.parse(details) : {},
      order: order || homeData.catalogue.length,
      isActive: true,
    };

    homeData.catalogue.push(newCatalogue);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Catalogue added successfully",
      data: homeData.catalogue,
    });
  } catch (error) {
    console.error("Error adding catalogue:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const homeData = await Home.getHomeData();

    const index = homeData.catalogue.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Catalogue not found" });
    }

    if (updates.details) {
      updates.details =
        typeof updates.details === "string"
          ? JSON.parse(updates.details)
          : updates.details;
    }

    homeData.catalogue[index] = {
      ...homeData.catalogue[index].toObject(),
      ...updates,
    };
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Catalogue updated successfully",
      data: homeData.catalogue[index],
    });
  } catch (error) {
    console.error("Error updating catalogue:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadCatalogueImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { id } = req.body;
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      const index = homeData.catalogue.findIndex(
        (item) => item._id.toString() === id,
      );
      if (index === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Catalogue not found" });
      }

      if (homeData.catalogue[index].image) {
        const oldPath = path.join(
          __dirname,
          "..",
          homeData.catalogue[index].image,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      homeData.catalogue[index].image = imageUrl;
      await homeData.save();

      res.status(200).json({
        success: true,
        message: "Catalogue image uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error uploading catalogue image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const deleteCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const homeData = await Home.getHomeData();

    const index = homeData.catalogue.findIndex(
      (item) => item._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Catalogue not found" });
    }

    if (homeData.catalogue[index].image) {
      const imagePath = path.join(
        __dirname,
        "..",
        homeData.catalogue[index].image,
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    homeData.catalogue.splice(index, 1);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Catalogue deleted successfully",
      data: homeData.catalogue,
    });
  } catch (error) {
    console.error("Error deleting catalogue:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ EXPERT GUIDES CONTROLLERS ============
export const addExpertGuide = async (req, res) => {
  try {
    const {
      name,
      rating,
      reviews,
      satisfactionRate,
      expertise,
      experience,
      languages,
      expertiseAreas,
      order,
    } = req.body;
    const homeData = await Home.getHomeData();

    const newGuide = {
      name,
      rating: rating || 4.8,
      reviews: reviews || 892,
      satisfactionRate: satisfactionRate || 92,
      expertise: expertise || "",
      experience: experience || "15+ years",
      languages: languages
        ? typeof languages === "string"
          ? JSON.parse(languages)
          : languages
        : [],
      expertiseAreas: expertiseAreas
        ? typeof expertiseAreas === "string"
          ? JSON.parse(expertiseAreas)
          : expertiseAreas
        : [],
      isVerified: true,
      stats: {
        professionalExperience: experience || "15+ years",
        satisfiedClients: "4200+",
      },
      order: order || homeData.expertGuides.length,
      isActive: true,
    };

    homeData.expertGuides.push(newGuide);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Expert guide added successfully",
      data: homeData.expertGuides,
    });
  } catch (error) {
    console.error("Error adding expert guide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpertGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const homeData = await Home.getHomeData();

    const index = homeData.expertGuides.findIndex(
      (guide) => guide._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Expert guide not found" });
    }

    if (updates.languages && typeof updates.languages === "string") {
      updates.languages = JSON.parse(updates.languages);
    }
    if (updates.expertiseAreas && typeof updates.expertiseAreas === "string") {
      updates.expertiseAreas = JSON.parse(updates.expertiseAreas);
    }

    homeData.expertGuides[index] = {
      ...homeData.expertGuides[index].toObject(),
      ...updates,
    };
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Expert guide updated successfully",
      data: homeData.expertGuides[index],
    });
  } catch (error) {
    console.error("Error updating expert guide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadExpertGuideImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file uploaded" });
      }

      const { id } = req.body;
      const homeData = await Home.getHomeData();
      const imageUrl = "/uploads/home/" + req.file.filename;

      const index = homeData.expertGuides.findIndex(
        (guide) => guide._id.toString() === id,
      );
      if (index === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Expert guide not found" });
      }

      if (homeData.expertGuides[index].image) {
        const oldPath = path.join(
          __dirname,
          "..",
          homeData.expertGuides[index].image,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      homeData.expertGuides[index].image = imageUrl;
      await homeData.save();

      res.status(200).json({
        success: true,
        message: "Expert guide image uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error uploading expert guide image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const deleteExpertGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const homeData = await Home.getHomeData();

    const index = homeData.expertGuides.findIndex(
      (guide) => guide._id.toString() === id,
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Expert guide not found" });
    }

    if (homeData.expertGuides[index].image) {
      const imagePath = path.join(
        __dirname,
        "..",
        homeData.expertGuides[index].image,
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    homeData.expertGuides.splice(index, 1);
    await homeData.save();

    res.status(200).json({
      success: true,
      message: "Expert guide deleted successfully",
      data: homeData.expertGuides,
    });
  } catch (error) {
    console.error("Error deleting expert guide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all home data (admin)
export const getAllHomeData = async (req, res) => {
  try {
    const homeData = await Home.getHomeData();
    res.status(200).json({
      success: true,
      data: homeData,
    });
  } catch (error) {
    console.error("Error fetching all home data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
