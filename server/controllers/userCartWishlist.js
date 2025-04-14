const Product = require("../models/products");
const User = require("../models/user");
const { decodeJWT } = require("../helpers/auth");
const MAX_CART_QUANTITY = 10; // Maximum number of items allowed in the cart
const getUserCart = async (req, res) => {
  const { usertoken } = req.cookies;
  let localCart = [];
  if (req.cookies.cart) {
    try {
      localCart = JSON.parse(req.cookies.cart);
      if (!Array.isArray(localCart)) {
        localCart = []; // Fallback to empty array if not an array
      }
    } catch (error) {
      console.error("Error parsing cart cookie:", error);
      localCart = []; // Fallback to empty array if JSON parsing fails
    }
  }
  let cart = [];
  let productIds = [];

  if (usertoken) {
    const id = decodeJWT(usertoken);
    if (!id) {
      return res.status(403).json({ error: "Invalid token" });
    }
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
      variantStocks: variant.variantStocks,
    };
  });

  const calcAvailableItems = cartWithDetails.reduce((acc, item) => {
    const product = products.find(
      (p) => p._id.toString() === item.productId.toString()
    );
    const variant = product?.variants.find(
      (v) => v._id.toString() === item.variantId.toString()
    );

    // Only add items where variantStocks > 0
    if (variant && variant.variantStocks > 0) {
      acc.push({
        ...item,
        availableItems: variant.variantStocks, // Append availableItems
      });
    }

    return acc; // Accumulator holds the filtered and transformed items
  }, []);

  return res.json({
    cart: cartWithDetails,
    noOfAvailableItems: calcAvailableItems.length,
  });
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
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === cartItem.variantId.toString()
    );

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (variant.variantStocks <= 0) {
      return res.status(200).json({
        warning: "Product is out of stock",
      });
    }

    const existingQuantity =
      existingItemIndex >= 0 ? user.cart[existingItemIndex].quantity : 0;

    if (variant.variantStocks < cartItem.quantity + existingQuantity) {
      return res.status(200).json({
        warning: "Maximum quantity reached for this item",
      });
    }

    if (existingItemIndex >= 0) {
      // Update the quantity if it exists
      if (cartItem.quantity > user.cart[existingItemIndex].variantStocks) {
        return res.status(200).json({
          warning: "Maximum quantity reached for this item",
        });
      }
      if (existingItemIndex.quantity === MAX_CART_QUANTITY) {
        return res.status(200).json({
          warning: "Maximum quantity reached for this item",
        });
      }
      user.cart[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add the new item
      user.cart.push(cartItem);
    }

    await user.save();
    return res.status(200).json({ success: "Product added to cart" });
  } catch (error) {
    console.error("Error in addToCart:", error);
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

      const updatedCart = await Promise.all(
        cart.map(async (cartItem) => {
          const product = await Product.findById(cartItem.productId);
          if (!product) {
            return { error: `Product not found for ID: ${cartItem.productId}` };
          }

          const variant = product.variants.find(
            (v) => v._id.toString() === cartItem.variantId.toString()
          );
          if (!variant) {
            return { error: `Variant not found for ID: ${cartItem.variantId}` };
          }

          const existingCartItem = user.cart.find(
            (item) =>
              item.productId === cartItem.productId &&
              item.variantId === cartItem.variantId
          );
          const existingQuantity = existingCartItem
            ? existingCartItem.quantity
            : 0;

          // Ensure the requested quantity doesn't exceed available stock
          if (variant.variantStocks < cartItem.quantity + existingQuantity) {
            return {
              warning: `Maximum quantity of ${variant.variantStocks} reached for ${product.name}`,
            };
          }

          // Normalize item to ensure quantity cap at 10
          return {
            ...cartItem,
            quantity: cartItem.quantity > 10 ? 10 : cartItem.quantity,
          };
        })
      );

      // Separate errors/warnings from valid cart items
      const warnings = updatedCart.filter((item) => item.warning);
      const errors = updatedCart.filter((item) => item.error);
      const validCart = updatedCart.filter(
        (item) => !item.warning && !item.error
      );

      if (warnings.length > 0) {
        return res.status(200).json({ warnings });
      }

      if (errors.length > 0) {
        return res.status(404).json({ errors });
      }

      // Save valid cart data
      user.cart = validCart;
      await user.save();

      return res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
      console.error("Error saving cart:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "User ID and cart are required" });
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
    if (!id) {
      return res.status(403).json({ error: "Invalid token" });
    }
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
      variantStocks: variant.variantStocks,
    };
  });
  return res.json({ favs: wishlistWithDetails });
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
      quantity: 1, // Default to 1 if quantity is undefined
    }));

    // Process wishlist items and apply stock checks
    for (const item of wishlist) {
      if (!item.productId || !item.variantId) {
        return res.status(400).json({
          error: "Wishlist item missing required fields",
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          error: `Product not found for ID: ${item.productId}`,
        });
      }

      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      if (!variant) {
        return res.status(404).json({
          error: `Variant not found for ID: ${item.variantId}`,
        });
      }

      const existingItemIndex = user.cart.findIndex(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString() &&
          cartItem.variantId.toString() === item.variantId.toString()
      );

      const existingQuantity =
        existingItemIndex >= 0 ? user.cart[existingItemIndex].quantity : 0;

      // Check available stock
      const maxQuantity = Math.min(
        variant.variantStocks,
        item.quantity + existingQuantity
      );

      if (maxQuantity <= existingQuantity) {
        // If no additional stock is available, skip adding
        return res.status(200).json({
          warning: `Maximum quantity reached for ${product.name}.`,
        });
      }

      if (existingItemIndex >= 0) {
        // Update quantity for existing cart item
        user.cart[existingItemIndex].quantity = maxQuantity;
      } else {
        // Add new item to cart
        user.cart.push({
          ...item,
          quantity: maxQuantity, // Adjust quantity based on stock
        });
      }
    }

    // Clear wishlist after moving items to cart
    user.wishlist = [];
    await user.save();

    return res.status(200).json({ success: "Wishlist items added to cart." });
  } catch (error) {
    console.error("Error adding wishlist items to cart:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const checkItem = async (req, res) => {
  const { productId, variantId, quantity } = req.query;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (quantity >= variant.variantStocks) {
      console.log("Quantity exceeds available stock");
      return res.status(200).json({
        warning: "Maximum quantity reached for this item",
      });
    }
    return res.status(200).json({ success: "Item is available" });
  } catch (error) {
    console.error("Error checking item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addAllToCartLocal = async (req, res) => {
  try {
    // Extract wishlist and cart directly from the request body
    const wishlist = req.body.wishlist || [];
    const cart = req.body.cart || [];

    const updatedWishlist = []; // To retain items that couldn't be added
    const updatedCart = [...cart]; // Start with a copy of the existing cart

    for (const item of wishlist) {
      if (!item.productId || !item.variantId) {
        updatedWishlist.push(item); // Retain invalid items in the wishlist
        continue; // Skip to the next item
      }

      // Simulating product and variant retrieval for stock checks
      const product = await Product.findById(item.productId);
      if (!product) {
        updatedWishlist.push(item); // Retain items without a valid product
        continue; // Skip to the next item
      }

      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant || variant.variantStocks <= 0) {
        updatedWishlist.push(item); // Retain items without stock in the wishlist
        continue; // Skip to the next item
      }

      const existingItemIndex = updatedCart.findIndex(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variantId === item.variantId
      );

      const existingQuantity =
        existingItemIndex >= 0 ? updatedCart[existingItemIndex].quantity : 0;

      // Calculate the maximum quantity considering available stock
      const maxQuantity = Math.min(
        variant.variantStocks,
        item.quantity + existingQuantity
      );

      if (existingItemIndex >= 0) {
        updatedCart[existingItemIndex].quantity = maxQuantity; // Update existing cart item
      } else {
        updatedCart.push({
          ...item,
          quantity: maxQuantity, // Add new item to cart with adjusted quantity
        });
      }
    }

    // Return the updated wishlist and cart
    return res.status(200).json({
      success: "Wishlist items processed successfully.",

      updatedWishlist,
      updatedCart,
    });
  } catch (error) {
    console.error("Error processing wishlist:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
module.exports = {
  getUserCart,
  saveUserCart,
  addToCart,
  getUserFavs,
  addToFavs,
  addAllToCart,
  checkItem,
  addAllToCartLocal,
  saveUserFavs,
};
