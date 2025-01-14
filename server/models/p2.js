const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    variantName: String,
    variantColor: String,
    variantStocks: Number,
    variantSerials: [String],
    serialValue: String,
    inTheBox: [String],
    itbValue: String,
    variantImgs: [String],
    variantPrice: Number,
    isOnSale: { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    brand: String,
    subCategory: String,
    description: String,
    specification: [String],
    variants: [variantSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
