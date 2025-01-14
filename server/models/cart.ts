/* Steps to Implement:
Extract Local Cart: Retrieve the local cart from localStorage.

Merge Local and User Cart: Combine the local cart items with the server-stored cart items.

Save Merged Cart: Save the merged cart back to the server and update localStorage.

Updated loginUser Function:
javascript */
const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const tokenOptions = rememberMe ? { expiresIn: "7d" } : {};

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "Invalid email or password" });
    }

    // Check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Invalid email or password" });
    }

    // Sign token
    jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      tokenOptions,
      async (err, token) => {
        if (err) throw err;

        // Retrieve local cart
        const localCart = JSON.parse(req.cookies.localCart || "[]");

        // Retrieve user cart from server
        const userCart = user.cart || [];

        // Merge carts
        const mergedCart = mergeCarts(localCart, userCart);

        // Save merged cart to user document
        user.cart = mergedCart;
        await user.save();

        // Clear local cart
        res.cookie("localCart", "", { maxAge: 0 });

        // Set user token and return user data
        res.cookie("usertoken", token, {
          httpOnly: true,
          maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
        }).json(user);
      }
    );
  } catch (error) {
    return res.json({ error: "Internal server error" });
  }
};

// Utility function to merge carts
const mergeCarts = (localCart, userCart) => {
  const cartMap = new Map();

  // Add items from local cart
  localCart.forEach((item) => {
    const key = `${item.productId}-${item.variantId}`;
    if (cartMap.has(key)) {
      cartMap.get(key).quantity += item.quantity;
    } else {
      cartMap.set(key, { ...item });
    }
  });

  // Add items from user cart
  userCart.forEach((item) => {
    const key = `${item.productId}-${item.variantId}`;
    if (cartMap.has(key)) {
      cartMap.get(key).quantity += item.quantity;
    } else {
      cartMap.set(key, { ...item });
    }
  });

  return Array.from(cartMap.values());
};
/* Explanation:
Extract Local Cart: Retrieves the cart from req.cookies.localCart.

Merge Carts: Combines the local and user cart items.

Save Merged Cart: Updates the user’s cart in the database and clears the local cart.

Updated getUser Function:
Ensure the getUser function correctly retrieves user data, including the cart.

javascript */
const getUser = (req, res) => {
  const { usertoken } = req.cookies;
  if (usertoken) {
    jwt.verify(usertoken, process.env.JWT_SECRET, {}, async (err, decoded) => {
      if (err) throw err;
      const user = await User.findById(decoded.id).select('-password'); // Fetch user without password
      return res.json({ user });
    });
  } else {
    res.json({ user: null });
  }
};
/* This will allow the cart to merge seamlessly during login, ensuring a unified shopping experience. Ready to try this out? Anything else on your mind? 🚀 */