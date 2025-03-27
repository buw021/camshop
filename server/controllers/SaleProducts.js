const Product = require("../models/products");
const Sale = require("../models/sale");
const agenda = require("../jobs/agenda");

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
            { variantSaleInfo: { $eq: null } },
            { "variantSaleInfo.saleExpiryDate": { $lt: new Date() } },
            {
              $and: [
                { "variantSaleInfo.isOnSale": false }, // Paused sale
                { "variantSaleInfo.saleExpiryDate": { $lt: new Date() } }, // Expired sale
              ],
            },
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
    //check if the product + variantId is already on sale

    const existingSales = await Sale.find({
      productId: {
        $in: SaleList.selectedProducts.map((product) => product.productId),
      },
      variantId: {
        $in: SaleList.selectedProducts.map((product) => product.variantId),
      },
      saleExpiryDate: { $gt: new Date() },
      isOnSale: true,
    });

    if (existingSales.length > 0) {
      return res
        .status(400)
        .json({ error: "One or more products are already on sale." });
    }

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
    const totalSales = await Sale.countDocuments({
      $and: [
      ...query,
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
    });

    const saleList = await Sale.aggregate([
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

    res.json({ saleList, totalPages: Math.ceil(totalSales / limit) });

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

const resumeSale = async (req, res) => {
  const { id } = req.body;
  const dateToday = new Date();
  try {
    const saleProduct = await Sale.findById(id);
    if (saleProduct) {
      if (!saleProduct.isOnSale && saleProduct.saleExpiryDate > dateToday) {
        saleProduct.isOnSale = true;
        await saleProduct.save();
        res.status(200).json({ message: "Product sale status is resumed" });
      } else {
        res.status(400).json({
          error:
            "Sale cannot be resumed. It is either already on sale or expired.",
        });
      }
    } else {
      res.status(404).json({ error: "Sale product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to resume sale on a product" });
  }
};

const editSaleData = async (req, res) => {
  const { id, startDate, expiryDate } = req.body;
  const newStartDate = new Date(startDate);
  const newExpiryDate = new Date(expiryDate);

  if (newStartDate > newExpiryDate) {
    return res
      .status(400)
      .json({ error: "Start date cannot be later than expiry date." });
  }
  try {
    const saleProduct = await Sale.findById(id);
    if (saleProduct) {
      if (startDate) {
        saleProduct.saleStartDate = newStartDate;
      }
      if (expiryDate) {
        saleProduct.saleExpiryDate = newExpiryDate;
      }
      await saleProduct.save();
      res.status(200).json({ message: "Sale data updated successfully" });
    } else {
      res.status(404).json({ error: "Sale product not found" });
    }
  } catch (error) {
    console.error("Error updating sale data:", error);
    res.status(500).json({ error: "Failed to update sale data." });
  }
};

module.exports = {
  browseProducts,
  setProductOnSale,
  getSaleList,
  pauseSale,
  resumeSale,
  editSaleData,
};
