import ProductCategory from "../models/productCategory.js";

// @desc    Get all product categories
// @route   GET /api/product-categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    let categories = await ProductCategory.find().sort({ name: 1 });

    // Auto-seed if collection is empty
    if (categories.length === 0) {
      console.log("🔄 ProductCategory collection is empty. Seeding default categories...");
      const defaultCategories = [
        "Footwear",
        "Clothing",
        "Accessories",
        "Electronics",
        "Home & Living",
        "Sports",
        "Beauty",
        "Books",
      ];
      
      const seededData = defaultCategories.map(name => ({ name }));
      await ProductCategory.insertMany(seededData);
      
      // Fetch again after seeding
      categories = await ProductCategory.find().sort({ name: 1 });
      console.log("✅ Seeded default categories successfully");
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a product category
// @route   POST /api/product-categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    // Check if category already exists (case-insensitive check)
    const categoryExists = await ProductCategory.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await ProductCategory.create({ name: trimmedName });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a product category
// @route   DELETE /api/product-categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
