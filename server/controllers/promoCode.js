const applyPromoCode = async (orderId, promoCodeInput) => {
  try {
    const order = await Order.findById(orderId);
    const promoCode = await PromoCode.findOne({ code: promoCodeInput });

    if (!promoCode) {
      throw new Error("Invalid promo code.");
    }

    const now = new Date();
    if (promoCode.expirationDate < now) {
      throw new Error("Promo code has expired.");
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      throw new Error("Promo code usage limit reached.");
    }

    let discountAmount = 0;
    if (promoCode.discountType === "percentage") {
      discountAmount = (order.totalAmount * promoCode.discountValue) / 100;
    } else if (promoCode.discountType === "fixed") {
      discountAmount = promoCode.discountValue;
    }

    order.totalAmount -= discountAmount;
    order.promoCode = promoCode.code;
    order.discountAmount = discountAmount;

    await order.save();

    promoCode.usageCount += 1;
    await promoCode.save();

    return order;
  } catch (error) {
    throw error;
  }
};

module.exports = { applyPromoCode };
