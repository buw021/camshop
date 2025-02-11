const mongoose = require("mongoose");
const { Schema } = mongoose;

const saleSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      default: null,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "Product.variants",
      required: true,
      default: null,
    },
    isOnSale: { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
    saleStartDate: { type: Date, default: null },
    saleExpiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);

module.exports = Sale;
