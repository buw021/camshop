const { PromoCode } = require("../models/promo");

const addPromo = async (req, res) => {
  console.log(req.body);
  try {
    const promo = new PromoCode(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addPromo };
