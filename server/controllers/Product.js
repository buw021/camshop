const Product = require("../models/products");
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
        isOnSale: false,
        salePrice: null,
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
  try {
    const products = await Product.find({ isArchived: false }).select(
      "_id category name variants.variantPrice variants.variantStocks variants.variantImgs"
    );

    const productSummaries = products.map((product) => ({
      _id: product._id,
      category: product.category,
      name: product.name,
      variants: product.variants.map((variant) => ({
        variantPrice: variant.variantPrice,
        variantStocks: variant.variantStocks,
        variantImgs: variant.variantImgs[0], // Only the first image
      })),
    }));

    res.json(productSummaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArchivedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: true }).select(
      "_id category name variants.variantPrice variants.variantStocks variants.variantImgs"
    );

    const productSummaries = products.map((product) => ({
      _id: product._id,
      category: product.category,
      name: product.name,
      variants: product.variants.map((variant) => ({
        variantPrice: variant.variantPrice,
        variantStocks: variant.variantStocks,
        variantImgs: variant.variantImgs[0], // Only the first image
      })),
    }));

    res.json(productSummaries);
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

/* const getVariants = async (req, res) => {
  const { page = 1, limit = 20, sort = "default", category } = req.query;
  console.log(page, limit, sort, category);
  try {
    if (category === "all") {
      const products = await Product.find();
      variants = products.flatMap((product) =>
        product.variants.map((variant) => ({
          ...variant._doc,
          productName: product.name,
          productId: product._id,
          productBrand: product.brand,
        }))
      );
    } else {
      const products = await Product.find({ category: category });
      variants = products.flatMap((product) =>
        product.variants.map((variant) => ({
          ...variant._doc,
          productName: product.name,
          productId: product._id,
          productBrand: product.brand,
        }))
      );
    }
    // Sort variants
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
        // Add more sorting criteria as needed
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
    res.status(500).json({ error: error.message });
  }
}; */

/* const getVariants = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "default",
    subCategory,
    brand,
    minPrice,
    maxPrice,
    onSale,
    colors,
    specs,
  } = req.query;
  console.log(minPrice, maxPrice);
  const category = req.headers["category"];

  try {
    let query = {};

    if (category && category !== "all") query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (onSale === "true") query["variants.isOnSale"] = true;

    if (minPrice || maxPrice) {
      query.variants = { $elemMatch: {} };
      if (minPrice) query.variants.$elemMatch.variantPrice = { ...query.variants.$elemMatch.variantPrice, $gte: parseFloat(minPrice) };
      if (maxPrice) query.variants.$elemMatch.variantPrice = { ...query.variants.$elemMatch.variantPrice, $lte: parseFloat(maxPrice) };
    }

    if (colors) {
      query["variants.variantColor"] = { $in: colors.split(",") };
    }

    if (specs) {
      const specifications = JSON.parse(specs);
      Object.keys(specifications).forEach((key) => {
        query[`specifications.${key}`] = specifications[key];
      });
    }

    console.log(query);
    const products = await Product.find(query);
    const variants = products.flatMap((product) =>
      product.variants.filter(variant => {
        const meetsPriceCriteria = (!minPrice || variant.variantPrice >= parseFloat(minPrice)) &&
                                   (!maxPrice || variant.variantPrice <= parseFloat(maxPrice));
        return meetsPriceCriteria;
      }).map((variant) => ({
        ...variant._doc,
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
}; */

const getVariants = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "default",
    subCategory,
    brand,
    minPrice,
    maxPrice,
    onSale,
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

    const products = await Product.find(productQuery);
    const variants = products.flatMap((product) =>
      product.variants
        .filter((variant) => {
          const price =
            variant.isOnSale && variant.salePrice
              ? variant.salePrice
              : variant.variantPrice;
          const meetsVariantCriteria =
            (!variantQuery.isOnSale ||
              variant.isOnSale === variantQuery.isOnSale) &&
            (!minPrice || price >= parseFloat(minPrice)) &&
            (!maxPrice || price <= parseFloat(maxPrice)) &&
            (!variantQuery.variantColor ||
              variantQuery.variantColor.$in.includes(variant.variantColor));
          return meetsVariantCriteria;
        })
        .map((variant) => ({
          ...variant._doc,
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
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variant = product.variants.id(variantId.toString());

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
            isOnSale:
              variant.isOnSale !== undefined
                ? variant.isOnSale
                : existingVariant.isOnSale,
            salePrice:
              variant.salePrice !== undefined
                ? variant.salePrice
                : existingVariant.salePrice,
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
  getArchivedProducts,
  archiveProducts,
  getFullProduct,
};
