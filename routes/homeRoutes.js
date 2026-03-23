import express from "express";
import * as homeController from "../controllers/homeController.js";

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get("/", homeController.getHomeData);
router.get("/home", homeController.getHomeData);

// ============ DISCOVER SECTION ============
router.put("/admin/discover", homeController.updateDiscoverSection);
router.post("/admin/discover/image", homeController.uploadDiscoverImage);

// ============ DISCOVER YOUR PATH ============
router.post("/admin/discover-path", homeController.addDiscoverPath);
router.put("/admin/discover-path/:id", homeController.updateDiscoverPath);
router.delete("/admin/discover-path/:id", homeController.deleteDiscoverPath);
router.post(
  "/admin/discover-path/image",
  homeController.uploadDiscoverPathImage,
);

// ============ ACHIEVEMENTS ============
router.put("/admin/achievements", homeController.updateAchievements);
router.post("/admin/achievements/image", homeController.addAchievementImage);
router.delete(
  "/admin/achievements/image/:imageId",
  homeController.deleteAchievementImage,
);

// ============ MEDIA SPOTLIGHT ============
router.post("/admin/media-spotlight", homeController.addMediaSpotlight);
router.put("/admin/media-spotlight/:id", homeController.updateMediaSpotlight);
router.delete(
  "/admin/media-spotlight/:id",
  homeController.deleteMediaSpotlight,
);

// ============ CATALOGUE ============
router.post("/admin/catalogue", homeController.addCatalogue);
router.put("/admin/catalogue/:id", homeController.updateCatalogue);
router.delete("/admin/catalogue/:id", homeController.deleteCatalogue);
router.post("/admin/catalogue/image", homeController.uploadCatalogueImage);

// ============ EXPERT GUIDES ============
router.post("/admin/expert-guides", homeController.addExpertGuide);
router.put("/admin/expert-guides/:id", homeController.updateExpertGuide);
router.delete("/admin/expert-guides/:id", homeController.deleteExpertGuide);
router.post(
  "/admin/expert-guides/image",
  homeController.uploadExpertGuideImage,
);

// ============ GET ALL DATA (Admin) ============
router.get("/admin/all", homeController.getAllHomeData);

export default router;
