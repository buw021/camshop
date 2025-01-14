const Product = require("./models/Product"); // Adjust the import path as needed

const setProductOnSale = async (productId, salePrice) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    product.isOnSale = true;
    product.salePrice = salePrice;

    await product.save();
    console.log(`Product ${product.name} is now on sale for ${salePrice}`);
  } catch (error) {
    console.error("Error setting product on sale:", error);
  }
};

// Example usage:
setProductOnSale("60c72b2f9b1d8e4e4c8b4567", 19.99);

const removeProductFromSale = async (productId) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    product.isOnSale = false;
    product.salePrice = null;

    await product.save();
    console.log(`Product ${product.name} is no longer on sale`);
  } catch (error) {
    console.error("Error removing product from sale:", error);
  }
};

// Example usage:
removeProductFromSale("60c72b2f9b1d8e4e4c8b4567");
