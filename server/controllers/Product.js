const Product = require("../models/products");
const Sale = require("../models/sale");
const path = require("path");
const fs = require("fs");
/* const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error.message });
  }
}; */

const addProduct = async (req, res) => {
  try {
    const { product, fileImgs } = req.body;
    // Validate required fields

    const {
      name,
      category,
      subCategory,
      brand,
      description,
      specifications,
      variants,
      tags,
    } = product;

    if (!name || !category || !brand || !description) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (fileImgs.length < 1) {
      return res.status(400).json({ error: "Unable to fetch Images" });
    }
    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one variant is required." });
    }

    const specificationsMap =
      specifications && Array.isArray(specifications)
        ? specifications.reduce((acc, spec) => {
            const key = Object.keys(spec)[0];
            const value = spec[key];
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {})
        : {};

    const specificationsMapFinal = new Map(Object.entries(specificationsMap));

    const products = new Product({
      name,
      category,
      subCategory,
      brand,
      description,
      specifications: specificationsMap, // Default to empty array if not provided
      variants: variants.map((variant, index) => ({
        variantName: variant.variantName || "",
        variantColor: variant.variantColor || "",
        variantPrice: variant.variantPrice,
        variantStocks: variant.variantStocks,
        variantImgs: fileImgs[index],
        variantContent: variant.variantContent,
      })),
      tags: tags || [],
    });

    await products.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
};

const getFullProduct = async (req, res) => {
  const productId = req.query.id;

  try {
    const product = await Product.findById(productId);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  const { filters, currentPage, limit, archive, search } = req.query;

  try {
    let query = { isArchived: archive };

    if (filters && filters.category && filters.category.length > 0) {
      query.category = { $in: filters.category };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit);

    return res.status(200).json({ products, totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const archiveProducts = async (req, res) => {
  const { productIds, command } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Invalid product IDs." });
  }

  try {
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isArchived: command } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error archiving products:", error);
    res.status(500).json({ error: "Failed to archive products." });
  }
};

const getVariants = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "default",
    subCategory,
    brand,
    minPrice,
    maxPrice,
    onSale, //////rewrite this  saleID<
    colors,
    specs,
  } = req.query;

  const category = req.headers["category"];

  try {
    // Product level filters
    const filters = [];

    if (category && category !== "all") filters.push({ category });
    if (subCategory) filters.push({ subCategory });
    if (brand) filters.push({ brand });
    if (specs) {
      const specifications = JSON.parse(specs);
      Object.keys(specifications).forEach((key) => {
        filters.push({ [`specifications.${key}`]: specifications[key] });
      });
    }
    console.log("Limit:", limit, "Page:", page);
    const rawResults = await Product.aggregate([
      ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []),
      { $match: { isArchived: false } },
      { $unwind: "$variants" },
      // ...other stages...
    ]);
    console.log("Raw Results Count:", rawResults.length);
    // Variant level filters

    const variants = await Product.aggregate([
      ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []), // Filter products
      { $match: { isArchived: false } }, // Ensure only non-archived products are included
      { $unwind: "$variants" }, // Unwind variants for individual processing
      {
        $lookup: {
          from: "sales", // Join with Sale collection
          localField: "variants.saleId",
          foreignField: "_id",
          as: "saleDetails",
        },
      },
      {
        $addFields: {
          variantPrice: {
            $cond: [
              {
                $and: [
                  { $arrayElemAt: ["$saleDetails.isOnSale", 0] },
                  {
                    $gte: [
                      { $arrayElemAt: ["$saleDetails.saleExpiryDate", 0] },
                      new Date(),
                    ],
                  },
                ],
              },
              { $arrayElemAt: ["$saleDetails.salePrice", 0] },
              "$variants.variantPrice",
            ],
          },
        },
      },
      {
        $match: {
          ...(onSale === "true" && { "saleDetails.isOnSale": true }),
          ...(minPrice && { variantPrice: { $gte: parseFloat(minPrice) } }),
          ...(maxPrice && { variantPrice: { $lte: parseFloat(maxPrice) } }),
          ...(colors && {
            "variants.variantColor": { $in: colors.split(",") },
          }),
        },
      },
      {
        $sort:
          sort === "price-asc"
            ? { variantPrice: 1 }
            : sort === "price-desc"
            ? { variantPrice: -1 }
            : sort === "name-az"
            ? { productName: 1, "variants.variantName": 1 }
            : sort === "name-za"
            ? { productName: -1, "variants.variantName": -1 }
            : { createdAt: 1 },
      },

      {
        $project: {
          variantName: "$variants.variantName",
          variantColor: "$variants.variantColor",
          variantPrice: 1,
          variantStocks: "$variants.variantStocks",
          variantImgs: "$variants.variantImgs",
          variantContent: "$variants.variantContent",
          saleId: {
            $cond: [
              { $arrayElemAt: ["$saleDetails.isOnSale", 0] },
              {
                _id: { $arrayElemAt: ["$saleDetails._id", 0] },
                salePrice: { $arrayElemAt: ["$saleDetails.salePrice", 0] },
                saleStartDate: {
                  $arrayElemAt: ["$saleDetails.saleStartDate", 0],
                },
                saleExpiryDate: {
                  $arrayElemAt: ["$saleDetails.saleExpiryDate", 0],
                },
              },
              null,
            ],
          },
          _id: "$variants._id",
          createdAt: "$variants.createdAt",
          updatedAt: "$variants.updatedAt",
          productName: "$name",
          productId: "$_id",
          productBrand: "$brand",
        },
      },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    const total = await Product.aggregate([
      ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []), // Filter products
      { $unwind: "$variants" }, // Unwind variants for individual processing
      {
        $lookup: {
          from: "sales", // Join with Sale collection
          localField: "variants.saleId",
          foreignField: "_id",
          as: "saleDetails",
        },
      },
      {
        $addFields: {
          variantPrice: {
            $cond: [
              {
                $and: [
                  { $arrayElemAt: ["$saleDetails.isOnSale", 0] },
                  {
                    $gte: [
                      { $arrayElemAt: ["$saleDetails.saleExpiryDate", 0] },
                      new Date(),
                    ],
                  },
                ],
              },
              { $arrayElemAt: ["$saleDetails.salePrice", 0] },
              "$variants.variantPrice",
            ],
          },
        },
      },
      {
        $match: {
          ...(onSale === "true" && { "saleDetails.isOnSale": true }),
          ...(minPrice && { variantPrice: { $gte: parseFloat(minPrice) } }),
          ...(maxPrice && { variantPrice: { $lte: parseFloat(maxPrice) } }),
          ...(colors && {
            "variants.variantColor": { $in: colors.split(",") },
          }),
        },
      },
      { $count: "totalVariants" },
    ]);

    // Sorting logic
    console.log(total, variants.length);
    res.json({ variants, total: total[0].totalVariants });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  const [productName, productId, variantId] = req.params.details.split("_");

  try {
    const product = await Product.findOne({ _id: productId, isArchived: false })
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: {
          $and: [{ isOnSale: true }, { saleExpiryDate: { $gte: new Date() } }],
        },
        select: "salePrice saleStartDate saleExpiryDate", // Select specific fields if needed
      })
      .lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found or archived" });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );

    res.status(200).json({
      product,
      variant: variant ? variant : null,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { product, fileImgs, oldImagetodelete } = req.body;

    // Validate required fields
    const {
      _id,
      name,
      category,
      subCategory,
      brand,
      description,
      specifications,
      variants,
      tags,
    } = product;

    // Find the product by ID
    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Validate and transform specifications
    const specificationsMap =
      specifications && Array.isArray(specifications)
        ? specifications.reduce((acc, spec) => {
            const key = Object.keys(spec)[0];
            const value = spec[key];
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {})
        : {};

    // Update or add variants
    const updatedVariants = variants.map((variant, index) => {
      if (variant._id) {
        const existingVariant = existingProduct.variants.find(
          (v) => v._id.toString() === variant._id.toString()
        );

        if (existingVariant) {
          // Add new images if provided
          const updatedImgs =
            fileImgs && fileImgs[index]
              ? [...variant.variantImgs, ...fileImgs[index]]
              : variant.variantImgs;

          // Update existing variant
          return {
            ...existingVariant,
            variantName: variant.variantName || existingVariant.variantName,
            variantColor: variant.variantColor || existingVariant.variantColor,
            variantPrice:
              variant.variantPrice !== undefined
                ? variant.variantPrice
                : existingVariant.variantPrice,
            variantStocks:
              variant.variantStocks !== undefined
                ? variant.variantStocks
                : existingVariant.variantStocks,
            variantImgs: updatedImgs,
            variantContent:
              variant.variantContent || existingVariant.variantContent,
          };
        }
      } else {
        // Add new variant
        const newImgs = fileImgs[index];
        return {
          ...variant,
          variantImgs: newImgs,
        };
      }
    });

    // Update product fields
    existingProduct.name = name;
    existingProduct.category = category;
    existingProduct.subCategory = subCategory;
    existingProduct.brand = brand;
    existingProduct.description = description;
    existingProduct.specifications = specificationsMap;
    existingProduct.variants = updatedVariants;
    existingProduct.tags = tags;

    // Handle image deletion if any
    if (oldImagetodelete && oldImagetodelete.length > 0) {
      oldImagetodelete.forEach((file) => {
        const fullPath = path.join(__dirname, "..", "uploads", file);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await existingProduct.save();
    res.status(200).json({ success: true, product: existingProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProduct,
  getVariants,
  updateProduct,
  archiveProducts,
  getFullProduct,
};
