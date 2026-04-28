import { Service, ServiceRequest } from "../models/service.js";

// ============= CATEGORY & SUBCATEGORY MANAGEMENT =============

// @desc    Create a new category
// @route   POST /api/services/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, image, order } = req.body;

    const existingCategory = await Service.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await Service.create({
      name,
      description,
      icon,
      image,
      order,
      isActive: true,
      subcategories: [],
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories (with optional filtering)
// @route   GET /api/services/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const { isActive } = req.query;
    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const categories = await Service.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/services/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Service.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/services/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Service.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const updatedCategory = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (only if no pending requests)
// @route   DELETE /api/services/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Service.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check for pending requests
    const pendingRequests = await ServiceRequest.countDocuments({
      category: req.params.id,
      status: { $in: ["pending", "confirmed", "in_progress"] },
    });

    if (pendingRequests > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${pendingRequests} active request(s) exist for this category.`,
      });
    }

    await category.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle category active/inactive
// @route   PATCH /api/services/categories/:id/toggle
// @access  Private/Admin
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Service.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: `Category ${category.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Error in toggleCategoryStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= SUBCATEGORY MANAGEMENT =============

// @desc    Add subcategory to a category
// @route   POST /api/services/categories/:categoryId/subcategories
// @access  Private/Admin
export const addSubcategory = async (req, res) => {
  try {
    const { name, description, price, duration, icon, image, order } = req.body;
    const category = await Service.findById(req.params.categoryId);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check if subcategory with same name exists
    const subcategoryExists = category.subcategories.some(
      (sub) => sub.name.toLowerCase() === name.toLowerCase(),
    );

    if (subcategoryExists) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists in this category",
      });
    }

    category.subcategories.push({
      name,
      description,
      price,
      duration,
      icon,
      image,
      order,
      isActive: true,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Subcategory added successfully",
    });
  } catch (error) {
    console.error("Error in addSubcategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subcategory
// @route   PUT /api/services/categories/:categoryId/subcategories/:subcategoryId
// @access  Private/Admin
export const updateSubcategory = async (req, res) => {
  try {
    const category = await Service.findById(req.params.categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    // Update fields
    Object.assign(subcategory, req.body);
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: "Subcategory updated successfully",
    });
  } catch (error) {
    console.error("Error in updateSubcategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/services/categories/:categoryId/subcategories/:subcategoryId
// @access  Private/Admin
export const deleteSubcategory = async (req, res) => {
  try {
    const category = await Service.findById(req.params.categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check for pending requests with this subcategory
    const pendingRequests = await ServiceRequest.countDocuments({
      category: req.params.categoryId,
      "subcategory.name": category.subcategories.id(req.params.subcategoryId)
        ?.name,
      status: { $in: ["pending", "confirmed", "in_progress"] },
    });

    if (pendingRequests > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${pendingRequests} active request(s) exist for this subcategory.`,
      });
    }

    category.subcategories.pull({ _id: req.params.subcategoryId });
    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteSubcategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle subcategory active/inactive
// @route   PATCH /api/services/categories/:categoryId/subcategories/:subcategoryId/toggle
// @access  Private/Admin
export const toggleSubcategoryStatus = async (req, res) => {
  try {
    const category = await Service.findById(req.params.categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    subcategory.isActive = !subcategory.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: `Subcategory ${subcategory.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Error in toggleSubcategoryStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= SERVICE REQUESTS =============

// @desc    Submit service request
// @route   POST /api/services/requests
// @access  Public (with optional auth)
export const submitServiceRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      categoryId,
      subcategoryId,
      communicationMode,
      description,
      preferredDate,
      preferredTimeSlot,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !categoryId ||
      !subcategoryId ||
      !communicationMode ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if category exists and is active
    const category = await Service.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: "This category is currently unavailable",
      });
    }

    // Find subcategory
    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    if (!subcategory.isActive) {
      return res.status(400).json({
        success: false,
        message: "This subcategory is currently unavailable",
      });
    }

    // Create request
    const requestData = {
      name,
      email,
      phone,
      address,
      category: categoryId,
      categoryName: category.name,
      subcategory: subcategory.toObject(),
      subcategoryName: subcategory.name,
      price: subcategory.price,
      communicationMode,
      description,
      preferredDate: preferredDate || null,
      preferredTimeSlot: preferredTimeSlot || null,
      isGuest: !req?.user,
    };

    if (req?.user) {
      requestData.user = req.user._id;
    }

    const serviceRequest = await ServiceRequest.create(requestData);

    const populatedRequest = await ServiceRequest.findById(
      serviceRequest._id,
    ).populate("category", "name description");

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message:
        "Service request submitted successfully! We'll contact you soon.",
    });
  } catch (error) {
    console.error("Error in submitServiceRequest:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all service requests
// @route   GET /api/services/requests
// @access  Private (Admin sees all, users see their own)
export const getServiceRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login to view requests.",
      });
    }

    let filter = {};
    const { status } = req.query;

    if (req.user.type !== "admin") {
      filter.user = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate("category", "name description icon")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error in getServiceRequests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service request
// @route   GET /api/services/requests/:id
// @access  Private (Admin or Owner)
export const getServiceRequestById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login to view request.",
      });
    }

    const request = await ServiceRequest.findById(req.params.id).populate(
      "category",
      "name description icon",
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Check authorization
    if (
      req.user.type !== "admin" &&
      request.user &&
      request.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error in getServiceRequestById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update request status
// @route   PATCH /api/services/requests/:id/status
// @access  Private/Admin
export const updateRequestStatus = async (req, res) => {
  try {
    if (!req.user || req.user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: `Request status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error in updateRequestStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service request
// @route   DELETE /api/services/requests/:id
// @access  Private/Admin
export const deleteServiceRequest = async (req, res) => {
  try {
    if (!req.user || req.user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    await request.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error in deleteServiceRequest:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= DASHBOARD STATS =============

// @desc    Get dashboard stats
// @route   GET /api/services/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [
      total,
      pending,
      completed,
      cancelled,
      activeCategories,
      totalSubcategories,
    ] = await Promise.all([
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: "pending" }),
      ServiceRequest.countDocuments({ status: "completed" }),
      ServiceRequest.countDocuments({ status: "cancelled" }),
      Service.countDocuments({ isActive: true }),
      Service.aggregate([
        { $unwind: "$subcategories" },
        { $match: { "subcategories.isActive": true } },
        { $count: "total" },
      ]),
    ]);

    // Category-wise distribution
    const categoryDistribution = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$categoryName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Subcategory-wise distribution
    const subcategoryDistribution = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$subcategoryName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent requests
    const recentRequests = await ServiceRequest.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        cancelledRequests: cancelled,
        activeCategories,
        totalSubcategories: totalSubcategories[0]?.total || 0,
        categoryDistribution,
        subcategoryDistribution,
        recentRequests,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
