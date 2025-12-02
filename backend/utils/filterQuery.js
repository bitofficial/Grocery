const filterData = (queryStr, filterParameter) => {
  const { lte, gte, category, keyword } = filterParameter;

  // Get all products from the file-based DB
  const allProducts = queryStr.find();

  // Filter by keyword search
  if (keyword !== undefined && keyword !== "") {
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Check if we have price filters
  const hasPriceFilter = lte && gte && lte !== "" && gte !== "";
  const hasCategory = category && category !== "";

  // Filter by price range and/or category
  if (hasPriceFilter || hasCategory) {
    return allProducts.filter((product) => {
      // Check price filter if present
      if (hasPriceFilter) {
        const rate = parseFloat(product.rate);
        const gteVal = parseFloat(gte);
        const lteVal = parseFloat(lte);
        if (rate < gteVal || rate > lteVal) {
          return false;
        }
      }

      // Check category filter if present
      if (hasCategory) {
        const categories = Array.isArray(category)
          ? category
          : category.split(",");
        if (!categories.includes(product.category)) {
          return false;
        }
      }

      return true;
    });
  }

  // Return all products if no filters applied
  return allProducts;
};

module.exports = { filterData };
