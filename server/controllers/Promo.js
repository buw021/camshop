const { PromoCode } = require("../models/promo");

const getPromos = async (req, res) => {
  const { type, search, currentPage, limit } = req.query; // Access query parameters

  try {
    let promos;
    const searchCondition = search
      ? { code: { $regex: search, $options: "i" } }
      : {};

    if (type === "active") {
      promos = await PromoCode.aggregate([
        {
          $match: {
            $and: [
              { $or: [{ endDate: { $gte: new Date() } }, { endDate: null }] },
              {
                $or: [
                  { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
                  { usageLimit: null },
                ],
              },
              searchCondition,
            ],
          },
        },
        {
          $skip: (parseInt(currentPage) - 1) * limit,
        },
        {
          $limit: parseInt(limit),
        },
      ]);
    } else if (type === "inactive") {
      promos = await PromoCode.aggregate([
        {
          $match: {
            $or: [
              { endDate: { $lt: new Date() } },
              {
                $and: [
                  { $expr: { $gte: ["$usageCount", "$usageLimit"] } },
                  { endDate: null },
                  { usageLimit: { $ne: null } },
                ],
              },
              {
                $expr: { $gte: ["$usageCount", "$usageLimit"] },
                usageLimit: { $ne: null },
              },
            ],
            $and: [searchCondition],
          },
        },
        {
          $skip: (parseInt(currentPage) - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ]);
    } else {
      promos = await PromoCode.find(searchCondition)
        .skip((currentPage - 1) * limit)
        .limit(limit);
    }
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const addPromo = async (req, res) => {
  try {
    const { code } = req.body;
    const existingPromo = await PromoCode.findOne({ code });
    if (existingPromo) {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    const promo = new PromoCode(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error.message });
  }
};

const updatePromo = async (req, res) => {
  const promo = req.body;
  try {
    const existingPromo = await PromoCode.findOne({ code: promo.code });
    if (existingPromo && existingPromo._id.toString() !== promo._id) {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    const updatedPromo = await PromoCode.findByIdAndUpdate(promo._id, promo, {
      new: true,
    });
    if (!updatedPromo) {
      return res.status(404).json({ error: "Promo code not found" });
    }
    res.status(200).json({ success: "Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPromos, addPromo, updatePromo };
