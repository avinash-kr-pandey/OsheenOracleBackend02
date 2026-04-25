import Service from "../models/service.js";
import ServiceRequest from "../models/ServiceRequest.js";

// ============= SERVICE CRUD (Admin + Website) =============

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category, icon, image, order } =
      req.body;

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service with this name already exists",
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      category,
      icon,
      image,
      order,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: service,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Error in createService:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all services (Website & Admin)
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const { isActive, category } = req.query;

    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error in getAllServices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Error in getServiceById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update service (Admin)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedService,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Error in updateService:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service (Admin)
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    // Check if any pending requests exist
    const pendingRequests = await ServiceRequest.countDocuments({
      service: req.params.id,
      status: { $in: ["pending", "confirmed", "in_progress"] },
    });

    if (pendingRequests > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${pendingRequests} active request(s) exist for this service.`,
      });
    }

    await service.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error in deleteService:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle service active/inactive (Admin)
// @route   PATCH /api/services/:id/toggle
// @access  Private/Admin
export const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      data: service,
      message: `Service ${service.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Error in toggleServiceStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= SERVICE REQUEST (Website Form Submission) =============

// @desc    Submit service request (Website)
// @route   POST /api/services/requests
// @access  Public (Logged in user or guest)
export const submitServiceRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      serviceId,
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
      !serviceId ||
      !communicationMode ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if service exists and is active
    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: "This service is currently unavailable",
      });
    }

    // Create request
    const requestData = {
      name,
      email,
      phone,
      address,
      service: serviceId,
      serviceName: service.name,
      communicationMode,
      description,
      preferredDate: preferredDate || null,
      preferredTimeSlot: preferredTimeSlot || null,
      isGuest: !req?.user,
    };

    // If user is logged in (optional auth se aaya hai)
    if (req?.user) {
      requestData.user = req.user._id;
    }

    const serviceRequest = await ServiceRequest.create(requestData);

    const populatedRequest = await ServiceRequest.findById(
      serviceRequest._id,
    ).populate("service", "name price duration");

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

// @desc    Get all service requests (Admin + User)
// @route   GET /api/services/requests
// @access  Private (Admin sees all, User sees their own)
export const getServiceRequests = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login to view requests.",
      });
    }

    let filter = {};
    const { status } = req.query;

    // If not admin, only show user's own requests
    if (req.user.type !== "admin") {
      filter.user = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate("service", "name price duration")
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
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login to view request.",
      });
    }

    const request = await ServiceRequest.findById(req.params.id)
      .populate("service", "name description price duration")
      .populate("user", "name email phone");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Check authorization
    if (
      req.user.type !== "admin" &&
      request.user &&
      request.user._id.toString() !== req.user._id.toString()
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

// @desc    Update request status (Admin)
// @route   PATCH /api/services/requests/:id/status
// @access  Private/Admin
export const updateRequestStatus = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    if (req.user.type !== "admin") {
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

// @desc    Delete service request (Admin)
// @route   DELETE /api/services/requests/:id
// @access  Private/Admin
export const deleteServiceRequest = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    if (req.user.type !== "admin") {
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

// @desc    Get dashboard stats (Admin)
// @route   GET /api/services/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    if (req.user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [total, pending, completed, cancelled] = await Promise.all([
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: "pending" }),
      ServiceRequest.countDocuments({ status: "completed" }),
      ServiceRequest.countDocuments({ status: "cancelled" }),
    ]);

    // Service-wise distribution
    const serviceDistribution = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent requests
    const recentRequests = await ServiceRequest.find()
      .populate("service", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        cancelledRequests: cancelled,
        serviceDistribution,
        recentRequests,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
