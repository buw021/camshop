const User = require("../models/user");
const Admin = require("../models/admin");
const Product = require("../models/products");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

//Register
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    // Check if email and password are provided
    if (!email || !password) {
      return res.json({
        error: "Email and password are required",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({ email, password: hashedPassword });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    return res.json({
      error: "Internal server error",
    });
  }
};

//Check-email
const checkEmail = async (req, res) => {
  const email = req.query.email;
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.json({ exists: true });
  } else {
    return res.json({ exists: false });
  }
};

//LoginUser
const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const tokenOptions = rememberMe ? { expiresIn: "7d" } : {};
  //check user
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "Invalid email or password" });
  }
  try {
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_SECRET,
        tokenOptions,
        async (err, token) => {
          if (err) throw err;

          res.cookie("usertoken", token, {
            httpOnly: true,
            secure: false, // set this to true in production
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
          });
          // Set cookie expiration to 7 days if "Remember Me" is checked

          try {
            const localCart = req.cookies.cart
              ? JSON.parse(req.cookies.cart)
              : [];
            const mergedCart = mergeCarts(localCart, user.cart || []);
            user.cart = mergedCart;
            await user.save();
            res.cookie("cart", "", { maxAge: 0 });
            res.json(user);
          } catch (innerError) {
            console.error("Error merging carts:", innerError);
          }
        }
      );
    } else {
      return res.json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.json({ error: "Internal server error" });
  }
};

const mergeCarts = (localCart, userCart) => {
  try {
    const cartMap = new Map();
    localCart.forEach((item) => {
      const key = `${item.productId}-${item.variantId}`;
      if (cartMap.has(key)) {
        cartMap.get(key).quantity += item.quantity;
      } else {
        cartMap.set(key, { ...item });
      }
    });
    userCart.forEach((item) => {
      const key = `${item.productId}-${item.variantId}`;
      if (cartMap.has(key)) {
        cartMap.get(key).quantity += item.quantity;
      } else {
        cartMap.set(key, { ...item });
      }
    });
    return Array.from(cartMap.values());
  } catch (error) {
    console.error("Error merging carts:", error);
    throw new Error("Failed to merge carts");
  }
};

//getUser
/* const getUser = (req, res) => {
  const { usertoken } = req.cookies;
  if (usertoken) {
    jwt.verify(usertoken, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      try {

        return res.json({ user: user });
      } catch (err) {}
    });
  } else {
    res.json({ user: null });
  }
};
 */
const getUser = async (req, res) => {
  const { usertoken } = req.cookies;
  if (!usertoken) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(usertoken, process.env.JWT_SECRET);

    // Fetch user data using the decoded user ID
    const user = await User.findById(decoded.id).select(
      "email firstName lastName phoneNo address"
    ); // Exclude the password field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user, token: usertoken });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid token" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Get user Cart
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

// logout
const logout = (req, res) => {
  res.clearCookie("admintoken", "", { maxAge: 0 });
  res.clearCookie("usertoken", "", { maxAge: 0 });
  res.clearCookie("token", "", { maxAge: 0 });
  res.cookie("cart", "", { maxAge: 0 });
  res.json({ message: "Logged out successfully" });
};
/*res.cookie("usertoken", "", { maxAge: 1 });
  res.json({ message: "Logged out successfully" });
  res.cookie("admintoken", "", { maxAge: 1 });
  res.cookie("token", "", { maxAge: 1 });*/
const loginAdmin = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const tokenOptions = rememberMe ? { expiresIn: "7d" } : {};
    //check user
    const user = await Admin.findOne({ username });
    if (!user) {
      return res.json({ error: "Invalid email or password" });
    }
    //check password
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { username: user.username, id: user.id },
        process.env.JWT_ADMINSECRET,
        tokenOptions,
        (err, token) => {
          if (err) throw err;
          res
            .cookie("admintoken", token, {
              httpOnly: true,
              secure: false, // set this to true in production
              maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
            })
            .json(user); // Set cookie expiration to 7 days if "Remember Me" is checked
        }
      );
    } else {
      return res.json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.json({
      error: "Internal server error",
    });
  }
};

const getUserAdmin = async (req, res) => {
  const { admintoken } = req.cookies;
  if (admintoken) {
    try {
      const decoded = jwt.verify(admintoken, process.env.JWT_ADMINSECRET);
      const admin = await Admin.findById(decoded.id).select("username");
      if (!admin) {
        return res.status(404).json({ error: "user not found" });
      }
      return res.json({ admin, token: admintoken });
    } catch (error) {
      return res.status(403).json({ error: "Invalid token" });
    }
  } else {
    res.json({ user: null });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkEmail,
  getUser,
  getUserCart,
  saveUserCart,
  addToCart,
  getUserFavs,
  addToFavs,
  saveUserFavs,
  addAllToCart,
  logout,
  loginAdmin,
  getUserAdmin,
};
