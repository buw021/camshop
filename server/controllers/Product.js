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
        varianColor: variant.variantColor || "",
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
  const { filters, currentPage, limit, archive } = req.query;

  try {
    let query = { isArchived: archive };

    if (filters && filters.category && filters.category.length > 0) {
      query.category = { $in: filters.category };
    }
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit);
    res.json({ products, totalPages });
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
    let productQuery = {};
    if (category && category !== "all") productQuery.category = category;
    if (subCategory) productQuery.subCategory = subCategory;
    if (brand) productQuery.brand = brand;
    if (specs) {
      const specifications = JSON.parse(specs);
      Object.keys(specifications).forEach((key) => {
        productQuery[`specifications.${key}`] = specifications[key];
      });
    }

    // Variant level filters
    let variantQuery = {};
    if (onSale === "true") variantQuery.isOnSale = true;
    if (minPrice)
      variantQuery.variantPrice = {
        ...variantQuery.variantPrice,
        $gte: parseFloat(minPrice),
      };
    if (maxPrice)
      variantQuery.variantPrice = {
        ...variantQuery.variantPrice,
        $lte: parseFloat(maxPrice),
      };
    if (colors) variantQuery.variantColor = { $in: colors.split(",") };

    const products = await Product.find(productQuery)
      .populate({
        path: "variants.saleId",
        model: "Sale",
        match: {
          $and: [{ isOnSale: true }, { saleExpiryDate: { $gte: new Date() } }],
        },
        select: "salePrice saleStartDate saleExpiryDate",
      })
      .lean();
    const variants = products.flatMap((product) =>
      product.variants
        .filter((variant) => {
          const price =
            variant.saleId &&
            variant.saleId.isOnSale &&
            variant.saleId.salePrice
              ? variant.saleId.salePrice
              : variant.variantPrice;
          const meetsVariantCriteria =
            (!variantQuery.isOnSale ||
              (variant.saleId && variant.saleId.isOnSale) ===
                variantQuery.isOnSale) &&
            (!minPrice || price >= parseFloat(minPrice)) &&
            (!maxPrice || price <= parseFloat(maxPrice)) &&
            (!variantQuery.variantColor ||
              variantQuery.variantColor.$in.includes(variant.variantColor));
          return meetsVariantCriteria;
        })
        .map((variant) => ({
          ...variant,
          productName: product.name,
          productId: product._id,
          productBrand: product.brand,
        }))
    );

    // Sorting logic
    const sortedVariants = variants.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.variantPrice - b.variantPrice;
        case "price-desc":
          return b.variantPrice - a.variantPrice;
        case "name-az":
          return a.productName.localeCompare(b.productName);
        case "name-za":
          return b.productName.localeCompare(a.productName);
        default:
          return 0; // No sorting for default
      }
    });

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVariants = sortedVariants.slice(startIndex, endIndex);

    const total = variants.length; // Total number of variants
    res.json({ variants: paginatedVariants, total });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  const [productName, productId, variantId] = req.params.details.split("_");

  try {
    const product = await Product.findById(productId)
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
      return res.status(404).json({ error: "Product not found" });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );

    res.json({
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
