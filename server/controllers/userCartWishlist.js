const Product = require("../models/products");
const User = require("../models/user");
const { decodeJWT } = require("../helpers/auth");
const getUserCart = async (req, res) => {
  const { usertoken } = req.cookies;
  const localCart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  let cart = [];
  let productIds = [];
  if (usertoken) {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id).select("cart");
    if (user.cart.length === 0) {
      return res.json({ cart: [] });
    }
    productIds = user.cart.map((item) => item.productId);
    cart = user.cart;
  } else if (!usertoken) {
    productIds = localCart.map((item) => item.productId);
    cart = localCart;
  }

  const products = await Product.find({ _id: { $in: productIds } })
    .populate({
      path: "variants.saleId",
      model: "Sale",
      match: {
        $and: [{ isOnSale: true }, { saleExpiryDate: { $gte: new Date() } }],
      },
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
};

const addToCart = async (req, res) => {
  const { cartItem } = req.body;
  const { usertoken } = req.cookies;
  if (!usertoken || !cartItem) {
    return res
      .status(400)
      .json({ error: "No user Logged in and cart item are required" });
  }

  try {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find if the item already exists in the cart
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.productId.toString() === cartItem.productId &&
        item.variantId.toString() === cartItem.variantId
    );

    // Log existing item index

    if (existingItemIndex >= 0) {
      // Update the quantity if it exists
      user.cart[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add the new item
      user.cart.push(cartItem);
    }

    await user.save();
    return res.status(200).json({ success: "Product added to cart" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const saveUserCart = async (req, res) => {
  const { cart } = req.body;
  const { usertoken } = req.cookies;

  if (!usertoken) {
    return res.status(403).json({ error: "No token provided" });
  }

  if (usertoken && cart) {
    try {
      const id = decodeJWT(usertoken);
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      user.cart = cart;
      await user.save();
      return res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "User ID and cart are required" });
  }
};

const getUserFavs = async (req, res) => {
  const { usertoken } = req.cookies;
  const localWishlist = req.cookies.wishlist
    ? JSON.parse(req.cookies.wishlist)
    : [];
  let wishlist = [];
  let productIds = [];
  if (usertoken) {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id).select("wishlist");
    if (user.wishlist.length === 0) {
      return res.json({ wishlist: [] });
    }
    productIds = user.wishlist.map((item) => item.productId);
    wishlist = user.wishlist;
  } else if (!usertoken) {
    productIds = localWishlist.map((item) => item.productId);
    wishlist = localWishlist;
  }

  const products = await Product.find({ _id: { $in: productIds } })
    .populate({
      path: "variants.saleId",
      model: "Sale",
      match: {
        $and: [{ isOnSale: true }, { saleExpiryDate: { $gte: new Date() } }],
      },
      select: "salePrice saleStartDate saleExpiryDate",
    })
    .select("_id category name variants");

  const wishlistWithDetails = wishlist.map((wishlistItem) => {
    const product = products.find(
      (p) => p._id.toString() === wishlistItem.productId.toString()
    );
    const variant = product.variants.find(
      (v) => v._id.toString() === wishlistItem.variantId.toString()
    );
    return {
      productId: wishlistItem.productId,
      variantId: wishlistItem.variantId,
      name: product.name,
      variantName: variant.variantName,
      variantColor: variant.variantColor,
      variantImg: variant.variantImgs[0],
      price: variant.variantPrice,
      quantity: wishlistItem.quantity,
      saleId: variant.saleId ? { salePrice: variant.saleId.salePrice } : null,
    };
  });
  return res.json({ favs: wishlistWithDetails });
  console.log(wishlistWithDetails);
};

const addToFavs = async (req, res) => {
  const { item } = req.body;
  const { usertoken } = req.cookies;
  if (!usertoken || !item) {
    return res
      .status(400)
      .json({ error: "User ID and cart item are required" });
  }

  try {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingItemIndex = user.wishlist.findIndex(
      (useritem) =>
        useritem.productId.toString() === item.productId.toString() &&
        useritem.variantId.toString() === item.variantId.toString()
    );

    if (existingItemIndex < 0) {
      user.wishlist.push(item);
    } else {
      return res
        .status(200)
        .json({ warning: "Product is already added to wishlist" });
    }

    await user.save();
    return res.status(200).json({ success: "Product added to wishlist" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const saveUserFavs = async (req, res) => {
  const { favs } = req.body;
  const { usertoken } = req.cookies;
  if (usertoken && favs) {
    try {
      const id = decodeJWT(usertoken);
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      user.wishlist = favs;
      await user.save();
      return res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "User ID and cart are required" });
  }
};

const addAllToCart = async (req, res) => {
  const { usertoken } = req.cookies;

  try {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wishlist = user.wishlist.map((item) => ({
      ...item.toObject(),
      quantity: item.quantity || 1,
    }));
    wishlist.forEach((item) => {
      if (!item.productId || !item.variantId) {
        return res
          .status(400)
          .json({ error: "Wishlist item missing required fields" });
      }
      const existingItemIndex = user.cart.findIndex(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString() &&
          cartItem.variantId.toString() === item.variantId.toString()
      );
      if (existingItemIndex >= 0) {
        user.cart[existingItemIndex].quantity += item.quantity;
      } else {
        user.cart.push(item);
      }
    });
    user.wishlist = [];
    await user.save();
    return res.status(200).json({ success: "Wishlist items added to cart" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserCart,
  saveUserCart,
  addToCart,
  getUserFavs,
  addToFavs,
  saveUserFavs,
  addAllToCart,
};
