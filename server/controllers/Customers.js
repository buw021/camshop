const User = require("../models/user");
const Product = require("../models/products");
const Order = require("../models/orders");

const getUsers = async (req, res) => {
  const { searchQuery, currentPage, limit } = req.query;
  try {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }
    const users = await User.find(query)
      .select("_id firstName lastName email phoneNo address")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit);
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserDetails = async (req, res) => {
  const { customerID } = req.query;
  try {
    const userID = customerID;
    if (!userID) return res.status(400).json({ message: "User ID is empty" });
    const user = await User.findById(userID).select("-password");
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();
    const userIndex = users.findIndex((u) => u._id.toString() === userID);
    const prevUser = userIndex > 0 ? users[userIndex - 1]._id : null;
    const nextUser =
      userIndex < users.length - 1 ? users[userIndex + 1]._id : null;
    const totalUsers = await User.countDocuments();
    if (!user) res.status(400).json({ message: "User not found" });
    res.status(200).json({ user, prevUser, nextUser, totalUsers, userIndex });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getCartDetails = async (req, res) => {
  const { cartIDs, currentPage, limit } = req.body;

  try {
    const productIds = cartIDs.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: { isOnSale: true },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .select("_id category name variants");

    const cartWithDetails = cartIDs.map((cartItem) => {
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

const getWishlistDetails = async (req, res) => {
  const { wishlistIDs, currentPage, limit } = req.body;

  try {
    const productIds = wishlistIDs.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: { isOnSale: true },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .select("_id category name variants");

    const wishlistDetails = wishlistIDs.map((cartItem) => {
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
      };
    });
    return res.json({ wishlist: wishlistDetails });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.query;
  try {
    const order = await Order.findById(orderId);
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserDetails,
  getCartDetails,
  getWishlistDetails,
  getOrderDetails,
};
