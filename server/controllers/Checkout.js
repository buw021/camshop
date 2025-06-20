const Stripe = require("stripe");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");
const { getUser } = require("../helpers/getUser");
const STRIPE = new Stripe(process.env.STRIPE_SK);
const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const Product = require("../models/products");
const Order = require("../models/orders");
const { PromoCode, PromoCodeUsed } = require("../models/promo");
const Shipping = require("../models/shipping");
const User = require("../models/user");
const Payment = require("../models/payment");
const Notification = require("../models/notification");
const { getIO } = require("../helpers/socket");
const io = getIO();

const getProduct = async (productId, variantId) => {
  const product = await Product.findById(productId)
    .populate({
      path: "variants.saleId",
      model: "Sale",
      match: { isOnSale: true },
      select: "salePrice saleStartDate saleExpiryDate",
    })
    .lean();
  const variant = product.variants.find((v) => v._id.toString() === variantId);
  const price = variant.saleId
    ? variant.saleId.salePrice
    : variant.variantPrice;
  const image = variant.variantImgs[0];
  return {
    name: product.name,
    variant: variant.variantName,
    color: variant.variantColor,
    price: price,
    image: image,
  };
};

/* Webhook Stripe */

const stripeWebhookHandler = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;

    case "charge.succeeded":
      await handleChargeSucceeded(event.data.object);
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  /* if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customOrderId = session.metadata?.customOrderId;
    const userId = session.metadata?.userId;
    const promoCode = session.metadata?.promoCode;
    console.log(userId);
    console.log(promoCode);
    if (!customOrderId) {
      return res.status(400).send("Order ID not found in metadata.");
    }

    const order = await Order.findOne({ customOrderId });

    if (promoCode) {
      let userPromoUsage = await PromoCodeUsed.findOne({ userId: userId });

      // Initialize usage record if it doesn't exist
      if (!userPromoUsage) {
        userPromoUsage = new PromoCodeUsed({
          userId: userId,
          promoCodeUsed: [],
        });
      }

      // Check if promo code is already used
      const isUsed = userPromoUsage.promoCodeUsed.some(
        (entry) => entry.code === promoCode
      );

      if (!isUsed) {
        // Add the promo code
        userPromoUsage.promoCodeUsed.push({ code: promoCode });

        try {
          await userPromoUsage.save(); // Save user promo usage

          // Update promo code usage count
          const promo = await PromoCode.findOne({ code: promoCode });
          if (promo) {
            promo.usageCount += 1;
            await promo.save();
          }
        } catch (err) {
          console.error("Error saving promo data:", err);
        }
      }
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // CHECK HERE SOON!

    const orderItems = order.items;

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne(
          { _id: item.productId, "variants._id": item.variantId },
          { $inc: { "variants.$.stock": -item.quantity } }
        )
      )
    );

    order.totalAmount = session.amount_total / 100;
    order.status = "ordered";
    order.paymentStatus = true;
    order.paymentUrl = "";

    await order.save();
  }

  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const customOrderId = charge.metadata?.customOrderId;

    if (!customOrderId) {
      return res.status(400).send("Order ID not found in metadata.");
    }

    const order = await Order.findOne({ customOrderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.receiptLink = charge.receipt_url;

    await order.save();
  } */
  res.status(200).send();
};

/**
 * Handles the checkout session completion event.
 */
const handleCheckoutSessionCompleted = async (session) => {
  const { customOrderId, userId, promoCode } = session.metadata || {};

  if (!customOrderId) {
    console.error("Order ID missing from metadata.");
    return;
  }

  const order = await Order.findOne({ customOrderId });
  if (!order) {
    console.error(`Order not found for ID: ${customOrderId}`);
    return;
  }

  await processPromoCode(userId, promoCode);

  order.totalAmount = session.amount_total / 100;
  order.paymentUrl = "";
  await order.save();
};

/**
 * Handles the charge succeeded event.
 */
const handleChargeSucceeded = async (charge) => {
  const customOrderId = charge.metadata?.customOrderId;
  if (!customOrderId) {
    console.error("Order ID missing from metadata.");
    return;
  }

  const order = await Order.findOne({ customOrderId });
  if (!order) {
    console.error(`Order not found for ID: ${customOrderId}`);
    return;
  }

  order.receiptLink = charge.receipt_url;
  order.status = "ordered";
  order.paymentStatus = true;
  await updateStockLevels(order.items);
  await order.save();

  const existing = await Payment.findOne({ stripePaymentId: charge.id });
  if (!existing) {
    await Payment.create({
      stripePaymentId: charge.id,
      userId: order.userId,
      orderId: order._id,
      amount: order.originalTotalAmount,
      totalAmount: charge.amount / 100,
      shippingCost: order.shippingCost,
      shippingMethod: order.shippingOption,
      currency: charge.currency,
      paymentStatus: charge.status,
      paymentMethod: charge.payment_method_details?.type,
      created: new Date(charge.created * 1000),
      receiptUrl: charge.receipt_url,
      email: charge.billing_details?.email || order.userEmail,
    });
  }

  const notification = await Notification.create({
    orderId: order._id,
    customOrderId: customOrderId,
    message: `Order ${customOrderId} has been Paid'`,
    type: "paid",
  });
  const newCount = await Notification.countDocuments({ status: "unread" });
  // Emit to WebSocket
  io.emit("new-order", {
    customOrderID: customOrderId,
  });
  io.emit("notification:unreadCount", { unreadCount: newCount });
};

const processPromoCode = async (userId, promoCode) => {
  if (!promoCode) return;

  let userPromoUsage = await PromoCodeUsed.findOne({ userId });

  if (!userPromoUsage) {
    userPromoUsage = new PromoCodeUsed({ userId, promoCodeUsed: [] });
  }

  const isUsed = userPromoUsage.promoCodeUsed.some(
    (entry) => entry.code === promoCode
  );
  if (!isUsed) {
    userPromoUsage.promoCodeUsed.push({ code: promoCode });
    await userPromoUsage.save();

    const promo = await PromoCode.findOne({ code: promoCode });
    if (promo) {
      promo.usageCount += 1;
      await promo.save();
    }
  }
};

/**
 * Updates stock levels for purchased items.
 */
const updateStockLevels = async (orderItems) => {
  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
      )
    )
  );
};

/* Create Sessions */

const createNewCheckOutSession = async (req, res) => {
  const { usertoken } = req.cookies;
  const customOrderId = req.body.orderId;

  if (!usertoken) {
    return res.status(401).json({ error: "Unauthorized: Missing token." });
  }
  if (!customOrderId) {
    return res.status(400).json({ error: "Missing order ID." });
  }
  try {
    const userId = await getUser(usertoken);

    // Check session creation limit
    /*  const now = new Date();
    const sessionLimit = 5;
    const sessionWindowMs = 15 * 60 * 1000; // 15 minutes

    if (
      user.sessionCount >= sessionLimit &&
      now - user.lastSessionCreatedAt < sessionWindowMs
    ) {
      return res
        .status(429)
        .json({ error: "Too many sessions created. Please try again later." });
    }

    // Reset session count if window has passed
    if (now - user.lastSessionCreatedAt >= sessionWindowMs) {
      user.sessionCount = 0;
    }

    user.sessionCount += 1;
    user.lastSessionCreatedAt = now;
    await user.save();

    if (!userId) {
      return res.status(404).json({ error: "User not found." });
    } */

    const user = await User.findById(userId).populate({
      path: "orders._id",
      model: "Order",
      match: { archive: false },
      select: "status customOrderId",
    });

    const order = user.orders.find(
      (order) => order.customOrderId.toString() === customOrderId
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const populatedOrder = await Order.findById(order.orderId).select(
      "-__v -updatedAt -userId"
    );

    if (!populatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (
      ["processed", "shipped", "delivered"].includes(populatedOrder.status) ||
      populatedOrder.paymentStatus === true
    ) {
      return res
        .status(400)
        .json({ error: "This transaction is already processed." });
    }

    if (populatedOrder.sessionId) {
      try {
        const session = await STRIPE.checkout.sessions.retrieve(
          populatedOrder.sessionId
        );
        if (session.status !== "expired") {
          await STRIPE.checkout.sessions.expire(populatedOrder.sessionId);
        } else {
          console.log("Session already expired.");
        }
      } catch (error) {
        if (error.code !== "resource_missing") {
          throw error;
        }
        console.log("Session already expired or not found.");
      }
    }

    const lineItems = createLineItems(populatedOrder.items);
    const session = await createSession(
      lineItems,
      customOrderId,
      populatedOrder.shippingCost,
      populatedOrder.userEmail,
      populatedOrder.promoCode,
      user._id
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }
    populatedOrder.sessionId = session.id;
    populatedOrder.sessionUrl = session.url;
    await populatedOrder.save();
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

const createCheckoutSession = async (req, res) => {
  const { usertoken } = req.cookies;
  const { cart, address, shippingOption, promoCodeInput, userEmail } = req.body;

  try {
    const user = await getUser(usertoken);
    const shippingCost = await getShippingCost(shippingOption);

    let customOrderId;
    let isUnique = false;
    while (!isUnique) {
      customOrderId = generateOrderId();
      const existingOrder = await Order.findOne({ customOrderId });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    if (!user) {
      console.error("User not found for token:", usertoken);
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    let getItemFinalPrice = {
      discountedItems: [],
      fixedDiscount: 0,
      totalPrice: 0,
      code: null,
    };

    if (promoCodeInput) {
      getItemFinalPrice = await applyPromoCode(promoCodeInput, cart, user._id);
    }

    /*  this gets the discounted items and fixed discount amount
      discountedItems,
      fixedDiscount: discountAmount,
      totalPrice,
      code: promoCodeInput,
    }); */

    // Fetch product and variant details for each item in the cart
    const orderItems = (
      await Promise.all(
        cart.map(async (item) => {
          const product = await Product.findById(item.productId)
            .populate({
              path: "variants.saleId",
              model: "Sale",
              match: { isOnSale: true },
              select: "salePrice saleStartDate saleExpiryDate",
            })
            .lean();

          if (!product) {
            throw new Error(`Product not found for ID: ${item.productId}`);
          }

          const variant = product.variants.find(
            (variant) => variant._id.toString() === item.variantId
          );

          if (!variant) {
            throw new Error(`Variant not found for ID: ${item.variantId}`);
          }

          if (variant.variantStocks <= 0) {
            return null; // Return null for excluded items
          }

          const isOnSale = !!variant.saleId;

          let discountedPrice = null;
          if (promoCodeInput) {
            const discountedItem = getItemFinalPrice.discountedItems.find(
              (discountedItem) =>
                discountedItem.productId === item.productId &&
                discountedItem.variantId === item.variantId
            );
            discountedPrice = discountedItem
              ? discountedItem.discountedPrice
              : null;
          }

          return {
            productId: item.productId,
            variantId: item.variantId,
            name: product.name,
            variantName: variant.variantName || null,
            variantColor: variant.variantColor || null,
            variantImg: variant.variantImgs[0] || null,
            price: variant.variantPrice,
            isOnSale: isOnSale,
            salePrice: isOnSale ? variant.saleId.salePrice : null,
            discountedPrice: discountedPrice,
            quantity: item.quantity,
          };
        })
      )
    ).filter((item) => item !== null); // Filter out null items

    // Calculate the total amount
    const totalAmount = orderItems.reduce(
      (acc, item) =>
        acc +
        (item.discountedPrice ||
          (item.salePrice ? item.salePrice : item.price)) *
          item.quantity,
      0
    );

    const orig = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      customOrderId: customOrderId,
      userId: user._id,
      sessionUrl: "",
      sessionId: "",
      userEmail: userEmail,
      items: orderItems,
      totalAmount: totalAmount,
      shippingCost: shippingCost,
      shippingOption: shippingOption.shippingType.toLowerCase(),
      shippingAddress: address,
      promoCode: promoCodeInput,
      discountAmount:
        getItemFinalPrice.fixedDiscount ??
        totalAmount - orig + getItemFinalPrice.fixedDiscount,
      originalTotalAmount: orig,
      status: "pending",
    });

    const lineItems = createLineItems(orderItems);
    const session = await createSession(
      lineItems,
      customOrderId, // This is where the orderId is used
      shippingCost,
      userEmail,
      promoCodeInput,
      user._id
    );
    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    user.cart = [];
    user.orders.push({ orderId: newOrder._id, customOrderId: customOrderId }); // Correctly push the order reference
    newOrder.sessionId = session.id;
    newOrder.sessionUrl = session.url;
    await newOrder.save();
    await user.save();
    res.json({ id: session.id });
  } catch (error) {
    console.error(
      "Error creating checkout session:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: error.message });
  }
};

/* reusable fnc */

const createLineItems = (orderItems) => {
  const line_items = orderItems.map((item) => {
    const name =
      item.name +
      (item.variantName ? " - " + item.variantName : "") +
      (item.variantColor ? " (" + item.variantColor + ")" : "");

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: `${name}`,
          //image here will be converted into a url? when I transfer my images into the cloud and not in my backend
          images: [item.variantImg],
        },
        unit_amount: Math.round(
          (item.discountedPrice ||
            (item.salePrice ? item.salePrice : item.price)) * 100
        ), // amount in cents
      },
      quantity: item.quantity,
    };
  });
  return line_items;
};

const createSession = async (
  lineItems,
  customOrderId,
  shippingCost,
  userEmail,
  promoCode,
  userId
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: userEmail, // This should be the user's email
    line_items: lineItems,
    mode: "payment",
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingCost * 100, // Use parseInt for shippingOption
            currency: "eur",
          },
          display_name: "Shipping Fee",
        },
      },
    ],
    success_url: `${FRONTEND_URL}/order-status?orderId=${customOrderId}`,
    cancel_url: `${FRONTEND_URL}/order-status?orderId=${customOrderId}`,
    metadata: {
      customOrderId: customOrderId,
      promoCode: promoCode ? promoCode.toString() : null,
      userId: userId ? userId.toString() : null,
    },
    payment_intent_data: {
      metadata: {
        promoCode: promoCode ? promoCode.toString() : null,
        customOrderId: customOrderId,
        userId: userId ? userId.toString() : null,
      }, // Explicitly set metadata here
      description: `Order ${customOrderId}'`, // Add a description
    },
  });

  return sessionData;
};

const getShippingCost = async (shippingOption) => {
  try {
    const sfCost = await Shipping.findById(shippingOption);

    return sfCost.shippingCost;
  } catch (error) {
    console.error("Error getting shipping cost:", error);
    return { error: "Internal server error" };
  }
};

const applyPromoCode = async (promoCodeInput, cartIDs, userId) => {
  try {
    const promoCode = await PromoCode.findOne({ code: promoCodeInput });
    if (!promoCode) {
      return { error: "Invalid promo code." };
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return { error: "Promo code usage limit reached." };
    }

    if (promoCode.endDate && new Date(promoCode.endDate) < new Date()) {
      return { error: "Promo code has expired." };
    }

    const promoCodeUsed = await PromoCodeUsed.findOne({ userId });
    if (
      promoCodeUsed &&
      promoCodeUsed.promoCodeUsed.some((code) => code.code === promoCodeInput)
    ) {
      return { error: "Promo code already used." };
    }

    const products = await Product.find({
      _id: { $in: cartIDs.map((item) => item.productId) },
    })
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: {
          $and: [{ isOnSale: true }, { saleExpiryDate: { $gte: new Date() } }],
        },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .lean();

    const productMap = products.reduce((acc, product) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {});

    // Calculate the total price for each cartID
    let totalPrice = cartIDs.reduce((acc, cartItem) => {
      const product = productMap[cartItem.productId];

      if (!product) {
        return acc;
      }

      const variant = product.variants.find(
        (variant) => variant._id.toString() === cartItem.variantId
      );

      if (!variant) {
        return acc;
      }

      let productPrice = variant.variantPrice;

      // Check if the product has a sale price
      if (variant.saleId && variant.saleId.salePrice) {
        productPrice = variant.saleId.salePrice;
      }

      return acc + productPrice * cartItem.quantity;
    }, 0);

    if (totalPrice < promoCode.minimumOrderValue) {
      return {
        error: `Minimum order value is ${promoCode.minimumOrderValue}.`,
      };
    }

    // Calculate the discount and apply it
    let discountAmount = 0;
    let discountedItems = [];

    if (promoCode.type === "percentage") {
      if (promoCode.keywords && promoCode.keywords.length > 0) {
        // Apply percentage discount to products matching the promo keywords
        cartIDs.forEach((cartItem) => {
          const product = productMap[cartItem.productId];
          if (
            promoCode.keywords.includes(product.category) ||
            promoCode.keywords.includes(product.brand) ||
            promoCode.keywords.includes(product.subcategory)
          ) {
            const cartItem = cartIDs.find(
              (item) => item.productId === product._id.toString()
            );

            const variant = product.variants.find(
              (variant) => variant._id.toString() === cartItem.variantId
            );

            if (variant) {
              const discountedPrice =
                variant.variantPrice -
                (variant.variantPrice * promoCode.value) / 100;
              discountedItems.push({
                productId: product._id.toString(),
                variantId: variant._id.toString(),
                discountedPrice,
              });
            }
          }
        });
      } else {
        // Apply percentage discount to all products
        cartIDs.forEach((cartItem) => {
          const product = productMap[cartItem.productId];

          const variant = product.variants.find(
            (variant) => variant._id.toString() === cartItem.variantId
          );

          if (variant) {
            const discountedPrice =
              variant.variantPrice -
              (variant.variantPrice * promoCode.value) / 100;
            discountedItems.push({
              productId: product._id.toString(),
              variantId: variant._id.toString(),
              discountedPrice,
            });
          }
        });
      }
    } else if (promoCode.type === "fixed") {
      discountAmount = promoCode.value;
      totalPrice -= discountAmount;
    }

    // Return the discounted items
    return {
      discountedItems,
      fixedDiscount: discountAmount,
      totalPrice,
      code: promoCodeInput,
    };
  } catch (error) {
    console.error("Error applying promo code:", error);
    return { error: "Internal server error" };
  }
};

const generateOrderId = () => {
  const prefix = "CMSHP";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a random alphanumeric string
  return `${prefix}${date}${randomString}`;
};

module.exports = {
  stripeWebhookHandler,
  createCheckoutSession,
  createNewCheckOutSession,
};
