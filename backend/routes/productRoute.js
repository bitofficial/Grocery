const express = require("express");
const {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProduct,
  getSingleProduct,
  getRecentProducts,
} = require("../Controllers/productController");
const isAuthorized = require("../middleware/isAuthorized");
const isAuthUser = require("../middleware/isAuthUser");
const isAdminAuth = require("../middleware/isAdminAuth");
const route = express.Router();

// Admin-protected product endpoints: accept Bearer admin token via `isAdminAuth`
route.post("/add", isAdminAuth, addProduct);
route.get("/getAllProducts", getAllProduct);
route.get("/recent/products", getRecentProducts);
route.get("/getSingleProduct/:productId", getSingleProduct);
route.put("/update/:productId", isAdminAuth, updateProduct);
route.delete("/delete/:productId", isAdminAuth, deleteProduct);

module.exports = route;
