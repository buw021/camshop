const { PromoCode, PromoCodeUsed } = require("../models/promo");
const Order = require("../models/orders");
const { getUser } = require("../helpers/getUser");
const Product = require("../models/products");

const applyPromoCode = async (req, res) => {
  const { promoCodeInput, cartIDs } = req.body;
  const { usertoken } = req.cookies;

  try {
    const userId = await getUser(usertoken);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    const promoCode = await PromoCode.findOne({ code: promoCodeInput });
    if (!promoCode) {
      return res.status(400).json({ error: "Invalid promo code." });
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return res.status(400).json({ error: "Promo code usage limit reached." });
    }

    const promoCodeUsed = await PromoCodeUsed.findOne({ userId });
    if (
      promoCodeUsed &&
      promoCodeUsed.promoCodeUsed.some((code) => code.code === promoCodeInput)
    ) {
      return res.status(400).json({ error: "Promo code already used." });
    }

    const products = await Product.find({
      _id: { $in: cartIDs.map((item) => item.productId) },
    })
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: { isOnSale: true },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .lean();
    products.forEach((product) => {
      product.variants = product.variants.filter(
        (variant) => variant.variantStocks > 0
      );
    });

    // Create a map of productId to product details
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
      return res.status(400).json({
        error: `Minimum order value is ${promoCode.minimumOrderValue}.`,
      });
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
      // Apply fixed discount to the total price
      discountAmount = promoCode.value;
      totalPrice -= discountAmount;
    }

    // Update the promo code usage count
    /*  promoCode.usageCount += 1;
    await promoCode.save();

    // Save the promo code usage for the user
    if (!promoCodeUsed) {
      await PromoCodeUsed.create({
        userId,
        promoCodeUsed: [{ code: promoCodeInput }],
      });
    } else {
      promoCodeUsed.promoCodeUsed.push({ code: promoCodeInput });
      await promoCodeUsed.save();
    } */

    // Return the discounted items

    if (totalPrice <= 0) {
      totalPrice = 0;
    }
    console.log({
      discountedItems,
      fixedDiscount: discountAmount,
      totalPrice,
      code: promoCodeInput,
    });
    res.json({
      discountedItems,
      fixedDiscount: discountAmount,
      totalPrice,
      code: promoCodeInput,
    });
  } catch (error) {
    console.error("Error applying promo code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { applyPromoCode };
