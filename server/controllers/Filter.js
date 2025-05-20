const Product = require("../models/products");

const getFilters = async (req, res) => {
  const category = req.headers["category"];
  try {
    const [subcategories, colors, prices, brands] = await Promise.all([
      // Aggregation for unique subcategories
      Product.aggregate([
        { $match: { category, isArchived: false } },
        { $group: { _id: "$subCategory" } },
        { $project: { _id: 0, subCategory: "$_id" } },
      ]), // Aggregation for unique colors
      Product.aggregate([
        { $match: { category, isArchived: false } },
        { $unwind: "$variants" },
        { $match: { "variants.variantColor": { $ne: null } } },
        { $group: { _id: "$variants.variantColor" } },
        { $project: { _id: 0, color: "$_id" } },
      ]), // Aggregation for prices ordered from lowest to highest
      Product.aggregate([
        { $match: { category, isArchived: false } },
        { $unwind: "$variants" },
        {
          $group: {
            _id: null,
            prices: { $addToSet: "$variants.variantPrice" },
          },
        },
        { $unwind: "$prices" },
        { $sort: { prices: 1 } },
        { $group: { _id: null, prices: { $push: "$prices" } } },
        { $project: { _id: 0, prices: 1 } },
      ]),
      Product.aggregate([
        { $match: { category, isArchived: false } },
        { $group: { _id: "$brand" } },
        { $project: { _id: 0, brand: "$_id" } },
      ]),
    ]);
    const filters = {
      subcategories,
      colors,
      prices: prices.length ? prices[0].prices : [],
      brands,
    };
    res.json(filters);
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFilters };
