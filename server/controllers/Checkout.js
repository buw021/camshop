const Stripe = require("stripe");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");
const { getUser } = require("../helpers/getUser");
const STRIPE = new Stripe(process.env.STRIPE_SK);
const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const Product = require("../models/products");
const Order = require("../models/orders");

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

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req, res) => {
  const { usertoken } = req.cookies;
  const { cart, address, shippingOption, promoCode } = req.body;

  try {
    const user = await getUser(usertoken);

    if (!user) {
      console.error("User not found for token:", usertoken);
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    //get the shipping cost from the shipping option
    // await shipping cost and promo code

    const newOrder = new Order({
      userId: user._id,
      items: cart,
      totalAmount: 0,
      shippingCost: 10,
      shippingOption: shippingOption,
      shippingAddress: address,
      promoCode: promoCode,
      discountAmount: 0,
      status: "ordered",
    });

    const lineItems = createLineItems(cart);

    const session = await createSession(
      lineItems,
      newOrder._id.toString(), // This is where the orderId is used
      shippingCost
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    await newOrder.save();
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

const createLineItems = (cart) => {
  const line_items = cart.map(async (item) => {
    const product = await getProduct(item.productId, item.variantId);

    if (!product) {
      throw new Error("Product not found for ID:", item.productId);
    }

    const name =
      product.name +
      (product.variant ? " - " + product.variant : "") +
      (product.color ? " (" + product.color + ")" : "");

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: `${name})`,
          //image here will be converted into a url? when I transfer my images into the cloud and not in my backend
          images: [product.image],
        },
        unit_amount: Math.round((product.price || 0) * 100), // amount in cents
      },
      quantity: item.quantity,
    };
  });
  return line_items;
};

const createSession = async (lineItems, orderId, shippingCost) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: lineItems,
    mode: "payment",
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 10 * 100, // Use parseInt for shippingOption
            currency: "eur",
          },
          display_name: "Shipping Fee",
        },
      },
    ],
    discounts: [
      {
        coupon: promoCode,
      },
    ],
    success_url: `${FRONTEND_URL}/success`,
    cancel_url: `${FRONTEND_URL}/cancel`,
    metadata: {
      orderId: orderId,
    },
  });

  return sessionData;
};

module.exports = { stripeWebhookHandler, createCheckoutSession };
