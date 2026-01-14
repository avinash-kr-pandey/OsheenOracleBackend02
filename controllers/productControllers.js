



import Product from "../models/product.js";

export const createProduct = async (req, res) => {
  try {
    const { hasColorOptions, colors, sizeOptions } = req.body;

    if (hasColorOptions && (!colors || !Array.isArray(colors) || colors.length === 0)) {
      return res.status(400).json({ success: false, message: "colors must be provided when hasColorOptions is true" });
    }

    // Optional basic validation for sizes
    if (sizeOptions && (!Array.isArray(sizeOptions) || sizeOptions.some(s => typeof s !== 'number'))) {
      return res.status(400).json({ success: false, message: "sizeOptions must be an array of numbers" });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { hasColorOptions, colors, sizeOptions } = req.body;

    if (hasColorOptions && (!colors || !Array.isArray(colors) || colors.length === 0)) {
      return res.status(400).json({ success: false, message: "colors must be provided when hasColorOptions is true" });
    }

    if (sizeOptions && (!Array.isArray(sizeOptions) || sizeOptions.some(s => typeof s !== 'number'))) {
      return res.status(400).json({ success: false, message: "sizeOptions must be an array of numbers" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin-only: Add a review to a product
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = {
      admin: req.user.id,
      rating,
      comment,
    };

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;
    // update average rating
    const total = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    product.averageRating = total / product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
