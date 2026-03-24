import {
  BecomeAMember,
  MembershipPlan,
  Benefit,
  Testimonial,
  AddOn,
  Stat,
} from "../models/becomeamember.js";
import mongoose from "mongoose";

// ==================== MEMBERSHIP APPLICATION ====================

// @desc    Create new membership application
// @route   POST /api/membership/apply
// @access  Public
export const createMembershipApplication = async (req, res) => {
  try {
    const { name, email, phone, countryCode, plan, newsletter } = req.body;

    // Check if email already exists
    const existingMember = await BecomeAMember.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "active", "contacted"] },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message:
          "An application with this email already exists. Our team will contact you soon.",
      });
    }

    // Create new membership application
    const application = new BecomeAMember({
      name,
      email: email.toLowerCase(),
      phone,
      countryCode,
      plan,
      newsletter: newsletter || true,
    });

    await application.save();

    res.status(201).json({
      success: true,
      message:
        "Membership application submitted successfully! Our team will contact you shortly.",
      data: {
        id: application._id,
        name: application.name,
        email: application.email,
        plan: application.plan,
        status: application.status,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all membership applications (Admin)
// @route   GET /api/membership/admin/applications
// @access  Private/Admin
export const getAllApplications = async (req, res) => {
  try {
    const {
      status,
      plan,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await BecomeAMember.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await BecomeAMember.countDocuments(filter);

    const stats = await BecomeAMember.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: stats[0] || { total: 0, pending: 0, active: 0, cancelled: 0 },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single application by ID (Admin)
// @route   GET /api/membership/admin/applications/:id
// @access  Private/Admin
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await BecomeAMember.findById(id)
      .select("-__v")
      .populate("contactHistory.contactedBy", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/membership/admin/applications/:id/status
// @access  Private/Admin
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await BecomeAMember.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;
    if (notes) application.notes = notes;

    if (status === "active" && application.status !== "active") {
      await application.activateSubscription();
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: {
        id: application._id,
        status: application.status,
        notes: application.notes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add contact history (Admin)
// @route   POST /api/membership/admin/applications/:id/contact
// @access  Private/Admin
export const addContactHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await BecomeAMember.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await application.markContacted(type, notes, userId);

    res.status(200).json({
      success: true,
      message: "Contact history added successfully",
      data: application.contactHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk update applications (Admin)
// @route   POST /api/membership/admin/applications/bulk-update
// @access  Private/Admin
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid application IDs array is required",
      });
    }

    const result = await BecomeAMember.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status,
          updatedAt: Date.now(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} applications updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export applications as CSV (Admin)
// @route   GET /api/membership/admin/export
// @access  Private/Admin
export const exportApplications = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const applications = await BecomeAMember.find(filter)
      .sort({ createdAt: -1 })
      .select("name email phone countryCode plan newsletter status createdAt");

    const csvHeader = "Name,Email,Phone,Plan,Newsletter,Status,Applied Date\n";
    const csvRows = applications.map((app) => {
      const fullPhone = app.phone ? `${app.countryCode} ${app.phone}` : "";
      return `${app.name},${app.email},${fullPhone},${app.plan},${app.newsletter},${app.status},${app.createdAt.toISOString()}`;
    });

    const csv = csvHeader + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=membership-applications.csv",
    );
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DYNAMIC CONTENT (Public) ====================

// @desc    Get all dynamic content for frontend
// @route   GET /api/membership/content
// @access  Public
export const getAllContent = async (req, res) => {
  try {
    console.log("🚀 Fetching all dynamic content...");

    const [plans, benefits, testimonials, addOns, stats] = await Promise.all([
      MembershipPlan.find({ isActive: true }).sort({ order: 1, createdAt: -1 }),
      Benefit.find({ isActive: true }).sort({ order: 1, createdAt: -1 }),
      Testimonial.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .limit(6),
      AddOn.find({ isActive: true }).sort({ order: 1, createdAt: -1 }),
      Stat.find({ isActive: true }).sort({ order: 1, createdAt: -1 }),
    ]);

    console.log("✅ Data fetched:", {
      plans: plans.length,
      benefits: benefits.length,
      testimonials: testimonials.length,
      addOns: addOns.length,
      stats: stats.length,
    });

    res.status(200).json({
      success: true,
      data: {
        membershipPlans: plans,
        benefits: benefits,
        testimonials: testimonials,
        addOns: addOns,
        stats: stats,
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllContent:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {
        membershipPlans: [],
        benefits: [],
        testimonials: [],
        addOns: [],
        stats: [],
      },
    });
  }
};

// ==================== MEMBERSHIP PLANS CRUD (Admin) ====================

export const getAllPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    // ✅ Force isActive to true
    const planData = {
      id: req.body.id,
      name: req.body.name,
      price: req.body.price,
      period: req.body.period || "month",
      features: req.body.features || [],
      popular: req.body.popular || false,
      isActive: true,
      order: req.body.order || 0,
    };
    const plan = await MembershipPlan.create(planData);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndDelete(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BENEFITS CRUD (Admin) ====================

export const getAllBenefits = async (req, res) => {
  try {
    const benefits = await Benefit.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: benefits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBenefit = async (req, res) => {
  try {
    // ✅ Force isActive to true
    const benefitData = {
      icon: req.body.icon,
      title: req.body.title,
      description: req.body.description,
      isActive: true,
      order: req.body.order || 0,
    };
    const benefit = await Benefit.create(benefitData);
    res.status(201).json({ success: true, data: benefit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    const benefit = await Benefit.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!benefit) {
      return res
        .status(404)
        .json({ success: false, message: "Benefit not found" });
    }
    res.status(200).json({ success: true, data: benefit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    await Benefit.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Benefit deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TESTIMONIALS CRUD (Admin) ====================

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      order: 1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    // ✅ Force isActive to true
    const testimonialData = {
      avatar: req.body.avatar,
      content: req.body.content,
      name: req.body.name,
      role: req.body.role,
      rating: req.body.rating || 5,
      isActive: true,
      isFeatured: req.body.isFeatured || false,
      order: req.body.order || 0,
    };
    const testimonial = await Testimonial.create(testimonialData);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await Testimonial.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADD-ONS CRUD (Admin) ====================

export const getAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOn.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: addOns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddOn = async (req, res) => {
  try {
    // ✅ Force isActive to true
    const addOnData = {
      service: req.body.service,
      price: req.body.price,
      description: req.body.description || "",
      isActive: true,
      order: req.body.order || 0,
    };
    const addOn = await AddOn.create(addOnData);
    res.status(201).json({ success: true, data: addOn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAddOn = async (req, res) => {
  try {
    const { id } = req.params;
    const addOn = await AddOn.findByIdAndUpdate(id, req.body, { new: true });
    if (!addOn) {
      return res
        .status(404)
        .json({ success: false, message: "Add-on not found" });
    }
    res.status(200).json({ success: true, data: addOn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAddOn = async (req, res) => {
  try {
    const { id } = req.params;
    await AddOn.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Add-on deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STATS CRUD (Admin) ====================

export const getAllStats = async (req, res) => {
  try {
    const stats = await Stat.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStat = async (req, res) => {
  try {
    // ✅ Force isActive to true
    const statData = {
      number: req.body.number,
      label: req.body.label,
      isActive: true,
      order: req.body.order || 0,
    };
    const stat = await Stat.create(statData);
    res.status(201).json({ success: true, data: stat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStat = async (req, res) => {
  try {
    const { id } = req.params;
    const stat = await Stat.findByIdAndUpdate(id, req.body, { new: true });
    if (!stat) {
      return res
        .status(404)
        .json({ success: false, message: "Stat not found" });
    }
    res.status(200).json({ success: true, data: stat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteStat = async (req, res) => {
  try {
    const { id } = req.params;
    await Stat.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Stat deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
