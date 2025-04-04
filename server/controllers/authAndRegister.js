const User = require("../models/user");
const Admin = require("../models/admin");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

/* const generateConfirmationToken = (user) => {
  return jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // Token expires in 1 day
  );
};
const sendConfirmationEmail = async (email, token) => {
  const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

  // Use a mailer like nodemailer to send the email
  await mailer.sendMail({
    to: email,
    subject: "Email Confirmation",
    text: `Please click the following link to confirm your email: ${confirmationLink}`,
  });
};
const confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID and update confirmation status
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.confirmation = true;
    await user.save();

    return res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.error("Error during email confirmation:", error);
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};
const requireConfirmation = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user.confirmation) {
    return res.status(403).json({ error: "Email not confirmed" });
  }
  next();
}; */

//Register
const registerUser = async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    try {
      await User.create({
        email,
        password: hashedPassword,
        firstname,
        lastname,
      });
    } catch (error) {
      console.error("Error during user creation:", error);
      return res
        .status(500)
        .json({ error: "Internal server error during user creation" });
    }

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Unhandled server error:", error);
    return res.status(500).json({ error: "Internal server error" });
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
  try {
    const { email, password, rememberMe } = req.body;
    const tokenOptions = rememberMe ? { expiresIn: "7d" } : {};

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "Invalid email or password" });
    }

    //Uncomment this when email confirmation is implemented
    /* if (user.confirmed === false) {
      return res.json({ warning: "Email not confirmed" });
    } */

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
          } catch (innerError) {
            console.error("Error merging carts:", innerError);
          }
          res.json(user);
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

const getUser = async (req, res) => {
  const { usertoken } = req.cookies;
  if (!usertoken) {
    return res.json({ user: null });
  }

  try {
    const id = decodeJWT(usertoken);

    // Fetch user data using the decoded user ID
    const user = await User.findById(id).select(
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
  logout,
  loginAdmin,
  getUserAdmin,
};
