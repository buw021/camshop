const mongoose = require("mongoose");


const variantSchema = new mongoose.Schema(
  {
    variantName: { type: String }, // Variant name, e.g., "Black", "Body Only"
    variantColor: { type: String, index: true }, // Variant color
    variantPrice: { type: Number, required: true },
    variantStocks: { type: Number, required: true },
    variantImgs: [String], // Array of image paths or URLs
    variantContent: [String],
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true }, // Index on category for filtering
    subCategory: { type: String, index: true }, // Index on subCategory for filtering
    brand: { type: String, required: true, index: true }, // Index on brand for filtering
    description: { type: String, required: true },
    specifications: { type: Map, of: String, index: true }, // Dynamic specifications (key-value pairs)
    variants: [variantSchema], // Different configurations of the product
    tags: [String], // Keywords for better search filtering
    isArchived: { type: Boolean, default: false }, // Archive products instead of deleting them
    archivedAt: { type: Date, default: null }, // Date when the product was archived
  },
  { timestamps: true }
);

// Creating a compound index for more efficient searches
productSchema.index({ category: 1, brand: 1, subCategory: 1 });

const Product = mongoose.model("Product", productSchema);

// Event listener for index creation

module.exports = Product;
