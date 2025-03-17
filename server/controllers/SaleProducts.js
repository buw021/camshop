const Product = require("../models/products");
const Sale = require("../models/sale");

const browseProducts = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: false })
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: { isOnSale: true }, // Only populate if isOnSale is true
        select: "salePrice saleStartDate saleExpiryDate", // Select specific fields if needed
      })
      .select("_id category name variants");

    const productVariants = products.map((product) => ({
      _id: product._id,
      name: product.name,
      category: product.category,
      variants: product.variants
        .filter((variant) => !variant.saleId || !variant.saleId.isOnSale) // Exclude variants with saleId and isOnSale true
        .map((variant) => ({
          _id: variant._id,
          variantName: variant.variantName,
          variantColor: variant.variantColor,
          variantPrice: variant.variantPrice,
        })),
    }));

    res.json(productVariants);
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({ error: "Failed to fetch product variants." });
  }
};

const setProductOnSale = async (req, res) => {
  const { SaleList } = req.body;
  try {
    const sales = await Sale.insertMany(
      SaleList.selectedProducts.map((product) => ({
        productId: product.productId,
        variantId: product.variantId,
        saleStartDate: SaleList.startDate,
        saleExpiryDate: SaleList.endDate,
        salePrice:
          SaleList.discountType === "percentage"
            ? (
                product.variantPrice -
                (product.variantPrice * SaleList.discount) / 100
              ).toFixed(2)
            : (product.variantPrice - SaleList.discount).toFixed(2),
        isOnSale: true,
      }))
    );

    // Update the product variants with the sale IDs
    await Promise.all(
      sales.map(async (sale) => {
        await Product.updateOne(
          { _id: sale.productId, "variants._id": sale.variantId },
          { $set: { "variants.$.saleId": sale._id } }
        );
      })
    );

    res.json(sales);
  } catch (error) {
    console.error("Error setting products on sale:", error);
    res.status(500).json({ error: "Failed to set products on sale." });
  }
};

const getSaleList = async (req, res) => {
  const { search, currentPage, limit } = req.query;
  try {
    const salesWithProductDetails = await Sale.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $unwind: {
          path: "$productInfo.variants",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            { $expr: { $eq: ["$productInfo.variants._id", "$variantId"] } },
            {
              $or: [
                { "productInfo.name": { $regex: search, $options: "i" } },
                {
                  "productInfo.variants.variantName": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          variantId: 1,
          isOnSale: 1,
          salePrice: 1,
          saleStartDate: 1,
          saleExpiryDate: 1,
          "productInfo.name": 1,
          "productInfo.category": 1,
          "productInfo.variants.variantName": 1,
          "productInfo.variants.variantColor": 1,
          "productInfo.variants.variantPrice": 1,
        },
      },
      {
        $skip: (parseInt(currentPage) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),  
      },
    ]);

    res.json(salesWithProductDetails);
  } catch (error) {
    console.error("Error fetching sales with product details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch sales with product details." });
  }
};

module.exports = {
  browseProducts,
  setProductOnSale,
  getSaleList,
};
