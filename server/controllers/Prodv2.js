//filter

/* const fetchVariants = async (page, limit, sort, filters) => {
  try {
    const { category, subCategory, brand, minPrice, maxPrice, onSale, colors, specs } = filters;
    const response = await axiosInstance.get('/get-variants', {
      params: {
        page,
        limit,
        sort,
        category,
        subCategory,
        brand,
        minPrice,
        maxPrice,
        onSale,
        colors: colors.join(','), // Send colors as a comma-separated string
        specs: JSON.stringify(specs) // Send specs as a JSON string
      }
    });
    setEditProd(response.data.variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
  }
}; */

/* const getVariants = async (req, res) => {
  const { page = 1, limit = 20, sort = 'default', category, subCategory, brand, minPrice, maxPrice, onSale, colors, specs } = req.query;

  try {
    let query = {};

    if (category && category !== 'all') query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (onSale === 'true') query['variants.isOnSale'] = true;
    if (minPrice || maxPrice) {
      query['variants.variantPrice'] = {};
      if (minPrice) query['variants.variantPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['variants.variantPrice'].$lte = parseFloat(maxPrice);
    }
    if (colors) {
      query['variants.variantColor'] = { $in: colors.split(',') };
    }
    if (specs) {
      const specifications = JSON.parse(specs);
      Object.keys(specifications).forEach((key) => {
        query[`specifications.${key}`] = specifications[key];
      });
    }

    const products = await Product.find(query);
    const variants = products.flatMap((product) =>
      product.variants.map((variant) => ({
        ...variant._doc,
        productName: product.name,
        productId: product._id,
        productBrand: product.brand,
      }))
    );

    // Sorting logic
    const sortedVariants = variants.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.variantPrice - b.variantPrice;
        case 'price-desc':
          return b.variantPrice - a.variantPrice;
        case 'name-az':
          return a.productName.localeCompare(b.productName);
        case 'name-za':
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
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: error.message });
  }
};
 */

const ProductFilter = ({ setFilteredProducts }) => {
  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    onSale: false,
    colors: [],
    specs: {},
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSpecificationChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      specs: {
        ...prevFilters.specs,
        [key]: value,
      },
    }));
  };

  const handleColorChange = (color) => {
    setFilters((prevFilters) => {
      const colors = [...prevFilters.colors];
      if (colors.includes(color)) {
        const index = colors.indexOf(color);
        colors.splice(index, 1);
      } else {
        colors.push(color);
      }
      return { ...prevFilters, colors };
    });
  };

  const applyFilters = () => {
    fetchVariants(1, 20, "default", filters);
  };

  return (
    <div className="filter-container">
      {/* Category filter */}
      <select name="category" onChange={handleFilterChange}>
        {/* Map your categories here */}
      </select>

      {/* Subcategory filter */}
      <select name="subCategory" onChange={handleFilterChange}>
        {/* Map your subcategories here */}
      </select>

      {/* Brand filter */}
      <select name="brand" onChange={handleFilterChange}>
        {/* Map your brands here */}
      </select>

      {/* Price range filter */}
      <input
        type="number"
        name="minPrice"
        placeholder="Min Price"
        onChange={handleFilterChange}
      />
      <input
        type="number"
        name="maxPrice"
        placeholder="Max Price"
        onChange={handleFilterChange}
      />

      {/* On sale filter */}
      <label>
        On Sale
        <input type="checkbox" name="onSale" onChange={handleFilterChange} />
      </label>

      {/* Color filter */}
      <div className="color-filter">
        {/* Replace the array with actual color options */}
        {["Red", "Blue", "Green"].map((color) => (
          <label key={color}>
            {color}
            <input
              type="checkbox"
              name="colors"
              value={color}
              onChange={() => handleColorChange(color)}
            />
          </label>
        ))}
      </div>

      {/* Specifications filter */}
      <div className="specs-filter">
        {/* Replace the object with actual specification options */}
        {Object.entries({ Resolution: "", Weight: "" }).map(([key, value]) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type="text"
              name={`specs.${key}`}
              onChange={(e) => handleSpecificationChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={applyFilters}>Apply Filters</button>
    </div>
  );
};
