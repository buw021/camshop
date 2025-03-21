const Product = require("../models/products");
const Sale = require("../models/sale");
const agenda = require("../jobs/saleJobs");

const browseProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isArchived: false } },
      {
        $lookup: {
          from: "sales",
          localField: "variants.saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$variants" },
      {
        $lookup: {
          from: "sales",
          localField: "variants.saleId",
          foreignField: "_id",
          as: "variantSaleInfo",
        },
      },
      {
        $unwind: { path: "$variantSaleInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          $or: [
            { "variantSaleInfo.isOnSale": { $ne: true } },
            { "variantSaleInfo.saleExpiryDate": { $lt: new Date() } },
            { variantSaleInfo: { $eq: null } },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          category: { $first: "$category" },
          variants: {
            $push: {
              _id: "$variants._id",
              variantName: "$variants.variantName",
              variantColor: "$variants.variantColor",
              variantPrice: "$variants.variantPrice",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          variants: 1,
        },
      },
    ]);
    console.log;
    res.json(products);
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({ error: "Failed to fetch product variants." });
  }
};

const setProductOnSale = async (req, res) => {
  const { SaleList } = req.body;
  try {
    //check is the product + variantId is already on sale
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
        await agenda.schedule(sale.saleExpiryDate, "disable sale", {
          saleId: sale._id,
        });
      })
    );

    res.status(200).json({ message: "Sale created and scheduled!", sales });
  } catch (error) {
    console.error("Error setting products on sale:", error);
    res.status(500).json({ error: "Failed to set products on sale." });
  }
};

const getSaleList = async (req, res) => {
  const { status, search, currentPage, limit } = req.query;
  let query = [];
  if (status === "true") {
    query = [{ isOnSale: true }, { saleExpiryDate: { $gt: new Date() } }];
  } else {
    query = [
      { $or: [{ isOnSale: false }, { saleExpiryDate: { $lt: new Date() } }] },
    ];
  }
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
            ...query,
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

const pauseSale = async (req, res) => {
  const { id } = req.body;

  try {
    const saleProduct = await Sale.findById(id);
    saleProduct.isOnSale = false;
    await saleProduct.save();
    res.status(200).json({ message: "Product sale status is paused" });
  } catch (error) {
    res.status(500).json({ error: "Failed to pause sale on a product" });
  }
};

module.exports = {
  browseProducts,
  setProductOnSale,
  getSaleList,
  pauseSale,
};
