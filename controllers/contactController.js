import Contact from "../models/Contact.js";

// @desc    Create new contact/booking
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      desiredDate,
      desiredTime,
      additionalMessage,
      preferredAstrologer,
      astrologerSpecialization,
      consultationType,
      consultationDuration,
      userId,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !desiredDate || !desiredTime) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, phone, desiredDate, desiredTime",
      });
    }

    // Validate date is not in past
    const bookingDate = new Date(desiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book consultation for past dates",
      });
    }

    // Create contact/booking
    const contact = await Contact.create({
      name,
      email,
      phone,
      desiredDate: bookingDate,
      desiredTime,
      additionalMessage: additionalMessage || "",
      preferredAstrologer: preferredAstrologer || null,
      astrologerSpecialization: astrologerSpecialization || null,
      consultationType: consultationType || "call",
      consultationDuration: consultationDuration || 30,
      userId: userId || null,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Consultation booked successfully! We will contact you soon.",
      data: contact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error booking consultation",
      error: error.message,
    });
  }
};

// @desc    Get all contacts (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      startDate,
      endDate,
      search,
    } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.desiredDate = {};
      if (startDate) query.desiredDate.$gte = new Date(startDate);
      if (endDate) query.desiredDate.$lte = new Date(endDate);
    }

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("assignedAstrologer", "name email phone type avatar")
      .populate("userId", "name email phone");

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching consultations",
      error: error.message,
    });
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate(
        "assignedAstrologer",
        "name email phone type avatar specialization",
      )
      .populate("userId", "name email phone");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching consultation details",
      error: error.message,
    });
  }
};

// @desc    Update contact/booking
// @route   PUT /api/contacts/:id
// @access  Private/Admin
export const updateContact = async (req, res) => {
  try {
    const {
      status,
      assignedAstrologer,
      adminNotes,
      astrologerNotes,
      paymentStatus,
      paymentAmount,
      transactionId,
      meetingLink,
      callScheduledTime,
      desiredDate,
      desiredTime,
      consultationType,
      consultationDuration,
    } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (assignedAstrologer) contact.assignedAstrologer = assignedAstrologer;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;
    if (astrologerNotes !== undefined)
      contact.astrologerNotes = astrologerNotes;
    if (paymentStatus) contact.paymentStatus = paymentStatus;
    if (paymentAmount) contact.paymentAmount = paymentAmount;
    if (transactionId) contact.transactionId = transactionId;
    if (meetingLink !== undefined) contact.meetingLink = meetingLink;
    if (callScheduledTime)
      contact.callScheduledTime = new Date(callScheduledTime);
    if (desiredDate) contact.desiredDate = new Date(desiredDate);
    if (desiredTime) contact.desiredTime = desiredTime;
    if (consultationType) contact.consultationType = consultationType;
    if (consultationDuration)
      contact.consultationDuration = consultationDuration;

    contact.updatedAt = Date.now();
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Consultation updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error updating consultation",
      error: error.message,
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Consultation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting consultation",
      error: error.message,
    });
  }
};

// @desc    Update contact status
// @route   PATCH /api/contacts/:id/status
// @access  Private/Admin
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    await contact.updateStatus(status);

    res.status(200).json({
      success: true,
      message: `Consultation status updated to ${status}`,
      data: contact,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};

// @desc    Assign astrologer to consultation
// @route   POST /api/contacts/:id/assign-astrologer
// @access  Private/Admin
export const assignAstrologer = async (req, res) => {
  try {
    const { astrologerId, astrologerNotes } = req.body;

    if (!astrologerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide astrologer ID",
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    await contact.assignAstrologer(astrologerId, astrologerNotes || "");

    res.status(200).json({
      success: true,
      message: "Astrologer assigned successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error assigning astrologer:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning astrologer",
      error: error.message,
    });
  }
};

// @desc    Get pending consultations
// @route   GET /api/contacts/pending/list
// @access  Private/Admin
export const getPendingConsultations = async (req, res) => {
  try {
    const pendingContacts = await Contact.getPendingConsultations();

    res.status(200).json({
      success: true,
      count: pendingContacts.length,
      data: pendingContacts,
    });
  } catch (error) {
    console.error("Error fetching pending consultations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending consultations",
      error: error.message,
    });
  }
};

// @desc    Get today's consultations
// @route   GET /api/contacts/today/list
// @access  Private/Admin
export const getTodaysConsultations = async (req, res) => {
  try {
    const todaysContacts = await Contact.getTodaysConsultations();

    res.status(200).json({
      success: true,
      count: todaysContacts.length,
      data: todaysContacts,
    });
  } catch (error) {
    console.error("Error fetching today's consultations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching today's consultations",
      error: error.message,
    });
  }
};

// @desc    Get consultations assigned to specific astrologer
// @route   GET /api/contacts/astrologer/my-consultations
// @access  Private/Astrologer
export const getAstrologerConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { assignedAstrologer: req.user.id };

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const consultations = await Contact.find(query)
      .sort({ desiredDate: 1, desiredTime: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name email phone");

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching astrologer consultations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching consultations",
      error: error.message,
    });
  }
};

// @desc    Get user's own consultations
// @route   GET /api/contacts/my-consultations
// @access  Private
export const getUserConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const consultations = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("assignedAstrologer", "name email phone type avatar");

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching user consultations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your consultations",
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/contacts/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalConsultations = await Contact.countDocuments();
    const pendingConsultations = await Contact.countDocuments({
      status: "pending",
    });
    const confirmedConsultations = await Contact.countDocuments({
      status: "confirmed",
    });
    const completedConsultations = await Contact.countDocuments({
      status: "completed",
    });
    const cancelledConsultations = await Contact.countDocuments({
      status: "cancelled",
    });
    const inProgressConsultations = await Contact.countDocuments({
      status: "in_progress",
    });

    // Today's consultations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysConsultations = await Contact.countDocuments({
      desiredDate: { $gte: today, $lt: tomorrow },
    });

    // This month's consultations
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyConsultations = await Contact.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Revenue calculation
    const revenue = await Contact.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          paymentAmount: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: null, total: { $sum: "$paymentAmount" } } },
    ]);

    // Status distribution for charts
    const statusDistribution = await Contact.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalConsultations,
        pending: pendingConsultations,
        confirmed: confirmedConsultations,
        completed: completedConsultations,
        cancelled: cancelledConsultations,
        inProgress: inProgressConsultations,
        todaysConsultations: todaysConsultations,
        monthlyConsultations: monthlyConsultations,
        totalRevenue: revenue[0]?.total || 0,
        statusDistribution: statusDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Cancel consultation (user or admin)
// @route   POST /api/contacts/:id/cancel
// @access  Private
export const cancelConsultation = async (req, res) => {
  try {
    const { reason } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    // Check if user owns this consultation or is admin
    if (
      req.user.type !== "admin" &&
      contact.userId &&
      contact.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this consultation",
      });
    }

    // Check if consultation can be cancelled (only pending or confirmed)
    if (!["pending", "confirmed"].includes(contact.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel consultation with status: ${contact.status}`,
      });
    }

    contact.status = "cancelled";
    contact.adminNotes = reason
      ? `${contact.adminNotes}\nCancellation reason: ${reason}`
      : contact.adminNotes;
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Consultation cancelled successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error cancelling consultation:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling consultation",
      error: error.message,
    });
  }
};
