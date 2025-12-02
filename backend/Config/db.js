const fs = require("fs");
const path = require("path");

// Database file paths
const dbDir = path.join(__dirname, "../data");
const usersFile = path.join(dbDir, "users.json");
const productsFile = path.join(dbDir, "products.json");
const categoriesFile = path.join(dbDir, "categories.json");
const ordersFile = path.join(dbDir, "orders.json");
const reviewsFile = path.join(dbDir, "reviews.json");

// Initialize database directory and files if they don't exist
const initializeDatabase = () => {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(categoriesFile)) {
    fs.writeFileSync(categoriesFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(reviewsFile)) {
    fs.writeFileSync(reviewsFile, JSON.stringify([], null, 2));
  }
};

// Helper function to read JSON file
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write JSON file
const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// ============== USERS ==============
const userDB = {
  create: (userData) => {
    const users = readJSON(usersFile);
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeJSON(usersFile, users);
    return newUser;
  },

  findOne: (query) => {
    const users = readJSON(usersFile);
    return users.find((user) => {
      for (const key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const users = readJSON(usersFile);
    return users.find((user) => user._id === id);
  },

  find: (query = {}) => {
    const users = readJSON(usersFile);
    if (Object.keys(query).length === 0) return users;
    return users.filter((user) => {
      for (const key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
  },

  updateOne: (query, updateData) => {
    const users = readJSON(usersFile);
    const index = users.findIndex((user) => {
      for (const key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
    if (index !== -1) {
      users[index] = { ...users[index], ...updateData };
      writeJSON(usersFile, users);
      return users[index];
    }
    return null;
  },

  findByIdAndUpdate: (id, updateData) => {
    const users = readJSON(usersFile);
    const index = users.findIndex((user) => user._id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updateData };
      writeJSON(usersFile, users);
      return users[index];
    }
    return null;
  },

  findByIdAndDelete: (id) => {
    const users = readJSON(usersFile);
    const index = users.findIndex((user) => user._id === id);
    if (index !== -1) {
      const deletedUser = users[index];
      users.splice(index, 1);
      writeJSON(usersFile, users);
      return deletedUser;
    }
    return null;
  },

  countDocuments: () => {
    const users = readJSON(usersFile);
    return users.length;
  },
};

// ============== CATEGORIES ==============
const categoryDB = {
  create: (categoryData) => {
    const categories = readJSON(categoriesFile);
    const newCategory = {
      _id: generateId(),
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    writeJSON(categoriesFile, categories);
    return newCategory;
  },

  findOne: (query) => {
    const categories = readJSON(categoriesFile);
    return categories.find((cat) => {
      for (const key in query) {
        if (cat[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const categories = readJSON(categoriesFile);
    return categories.find((cat) => cat._id === id);
  },

  find: (query = {}) => {
    const categories = readJSON(categoriesFile);
    if (Object.keys(query).length === 0) return categories;
    return categories.filter((cat) => {
      for (const key in query) {
        if (cat[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findByIdAndUpdate: (id, updateData) => {
    const categories = readJSON(categoriesFile);
    const index = categories.findIndex((cat) => cat._id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updateData };
      writeJSON(categoriesFile, categories);
      return categories[index];
    }
    return null;
  },

  findByIdAndDelete: (id) => {
    const categories = readJSON(categoriesFile);
    const index = categories.findIndex((cat) => cat._id === id);
    if (index !== -1) {
      const deletedCategory = categories[index];
      categories.splice(index, 1);
      writeJSON(categoriesFile, categories);
      return deletedCategory;
    }
    return null;
  },

  countDocuments: () => {
    const categories = readJSON(categoriesFile);
    return categories.length;
  },
};

// ============== PRODUCTS ==============
const productDB = {
  create: (productData) => {
    const products = readJSON(productsFile);
    const newProduct = {
      _id: generateId(),
      ...productData,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeJSON(productsFile, products);
    return newProduct;
  },

  findOne: (query) => {
    const products = readJSON(productsFile);
    return products.find((prod) => {
      for (const key in query) {
        if (prod[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const products = readJSON(productsFile);
    return products.find((prod) => prod._id === id);
  },

  find: (query = {}) => {
    const products = readJSON(productsFile);
    if (Object.keys(query).length === 0) return products;
    return products.filter((prod) => {
      for (const key in query) {
        if (prod[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findByIdAndUpdate: (id, updateData) => {
    const products = readJSON(productsFile);
    const index = products.findIndex((prod) => prod._id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData };
      writeJSON(productsFile, products);
      return products[index];
    }
    return null;
  },

  findByIdAndDelete: (id) => {
    const products = readJSON(productsFile);
    const index = products.findIndex((prod) => prod._id === id);
    if (index !== -1) {
      const deletedProduct = products[index];
      products.splice(index, 1);
      writeJSON(productsFile, products);
      return deletedProduct;
    }
    return null;
  },

  countDocuments: () => {
    const products = readJSON(productsFile);
    return products.length;
  },
};

// ============== ORDERS ==============
const orderDB = {
  create: (orderData) => {
    const orders = readJSON(ordersFile);
    const newOrder = {
      _id: generateId(),
      ...orderData,
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    writeJSON(ordersFile, orders);
    return newOrder;
  },

  findOne: (query) => {
    const orders = readJSON(ordersFile);
    return orders.find((order) => {
      for (const key in query) {
        if (order[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const orders = readJSON(ordersFile);
    return orders.find((order) => order._id === id);
  },

  find: (query = {}) => {
    const orders = readJSON(ordersFile);
    if (Object.keys(query).length === 0) return orders;
    return orders.filter((order) => {
      for (const key in query) {
        if (order[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findByIdAndUpdate: (id, updateData) => {
    const orders = readJSON(ordersFile);
    const index = orders.findIndex((order) => order._id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updateData };
      writeJSON(ordersFile, orders);
      return orders[index];
    }
    return null;
  },

  countDocuments: () => {
    const orders = readJSON(ordersFile);
    return orders.length;
  },
};

// ============== REVIEWS ==============
const reviewDB = {
  create: (reviewData) => {
    const reviews = readJSON(reviewsFile);
    const newReview = {
      _id: generateId(),
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    writeJSON(reviewsFile, reviews);
    return newReview;
  },

  findOne: (query) => {
    const reviews = readJSON(reviewsFile);
    return reviews.find((review) => {
      for (const key in query) {
        if (review[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const reviews = readJSON(reviewsFile);
    return reviews.find((review) => review._id === id);
  },

  find: (query = {}) => {
    const reviews = readJSON(reviewsFile);
    if (Object.keys(query).length === 0) return reviews;
    return reviews.filter((review) => {
      for (const key in query) {
        if (review[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findByIdAndDelete: (id) => {
    const reviews = readJSON(reviewsFile);
    const index = reviews.findIndex((review) => review._id === id);
    if (index !== -1) {
      const deletedReview = reviews[index];
      reviews.splice(index, 1);
      writeJSON(reviewsFile, reviews);
      return deletedReview;
    }
    return null;
  },

  countDocuments: () => {
    const reviews = readJSON(reviewsFile);
    return reviews.length;
  },
};

module.exports = {
  initializeDatabase,
  userDB,
  categoryDB,
  productDB,
  orderDB,
  reviewDB,
};
