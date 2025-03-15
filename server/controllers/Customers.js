const User = require("../models/user");
const Product = require("../models/product");
const { getProduct } = require("./Product");
const getUsers = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { LastName: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getCartDetails = async (req, res) => {
  const { cart } = req.query;
  try {
    const productIds = cart.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: { isOnSale: true },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .select("_id category name variants");

    const cartWithDetails = cart.map((cartItem) => {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );
      const variant = product.variants.find(
        (v) => v._id.toString() === cartItem.variantId.toString()
      );
      return {
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        name: product.name,
        variantName: variant.variantName,
        variantColor: variant.variantColor,
        variantImg: variant.variantImgs[0],
        price: variant.variantPrice,
        quantity: cartItem.quantity,
        saleId: variant.saleId ? { salePrice: variant.saleId.salePrice } : null,
      };
    });
    return res.json({ cart: cartWithDetails });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { getUsers, getProductDetails };
