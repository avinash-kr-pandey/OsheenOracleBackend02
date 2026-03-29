import express from "express";
import {
  createMembershipApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addContactHistory,
  bulkUpdateStatus,
  exportApplications,
  getAllContent,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
  getAllStats,
  createStat,
  updateStat,
  deleteStat,
} from "../controllers/BecomeAMemberController.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// TEMPORARY: Direct function call without any wrapper
router.post("/apply", async (req, res) => {
  console.log("🔵 ROUTE: /apply hit");
  try {
    await createMembershipApplication(req, res);
  } catch (error) {
    console.error("🔴 Route error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/content", getAllContent);

// ==================== ADMIN ROUTES ====================
router.get("/admin/applications", getAllApplications);
router.get("/admin/applications/:id", getApplicationById);
router.put("/admin/applications/:id/status", updateApplicationStatus);
router.post("/admin/applications/:id/contact", addContactHistory);
router.post("/admin/applications/bulk-update", bulkUpdateStatus);
router.get("/admin/export", exportApplications);

router.get("/admin/plans", getAllPlans);
router.post("/admin/plans", createPlan);
router.put("/admin/plans/:id", updatePlan);
router.delete("/admin/plans/:id", deletePlan);

router.get("/admin/benefits", getAllBenefits);
router.post("/admin/benefits", createBenefit);
router.put("/admin/benefits/:id", updateBenefit);
router.delete("/admin/benefits/:id", deleteBenefit);

router.get("/admin/testimonials", getAllTestimonials);
router.post("/admin/testimonials", createTestimonial);
router.put("/admin/testimonials/:id", updateTestimonial);
router.delete("/admin/testimonials/:id", deleteTestimonial);

router.get("/admin/addons", getAllAddOns);
router.post("/admin/addons", createAddOn);
router.put("/admin/addons/:id", updateAddOn);
router.delete("/admin/addons/:id", deleteAddOn);

router.get("/admin/stats", getAllStats);
router.post("/admin/stats", createStat);
router.put("/admin/stats/:id", updateStat);
router.delete("/admin/stats/:id", deleteStat);

export default router;
