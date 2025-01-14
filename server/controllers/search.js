const Product = require("../models/products");

const search = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find(
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
        ],
      },
      {
        _id: 1,
        name: 1,
        brand: 1,
        "variants._id": 1,
      }
    ).limit(8);

    // Map the results to include only the first variant
    const result = products.map((product) => ({
      id: product._id,
      name: product.name,
      brand: product.brand,
      variantId: product.variants[0]?._id,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const suggest = async (req, res) => {
  const { query } = req.query;
  try {
    const suggestions = await Product.find(
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
        ],
      },
      { _id: 0, name: 1 }
    ).limit(5);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminProductSearch = async (req, res) => {
  const { search, command } = req.query;
  console.log(search, command);
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ],
      isArchived: command,
    }).select(
      "_id category name variants.variantPrice variants.variantStocks variants.variantImgs"
    );

    // Map the results to include only the first variant
    const result = products.map((product) => ({
      _id: product._id,
      category: product.category,
      name: product.name,
      variants: product.variants.map((variant) => ({
        variantPrice: variant.variantPrice,
        variantStocks: variant.variantStocks,
        variantImgs: variant.variantImgs[0], // Only the first image
      })),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { search, suggest, adminProductSearch };
