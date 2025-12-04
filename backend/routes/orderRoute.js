const express = require("express");
const {
  newOrder,
  getMyOrders,
  getOrderDetails,
  adminAllOrders,
  AdminUpdateOrder,
} = require("../Controllers/orderController");
const isAuthUser = require("../middleware/isAuthUser");
const isAdminAuth = require("../middleware/isAdminAuth");
const route = express.Router();

// Customer Routes
route.post("/new", isAuthUser, newOrder);
route.get("/myorders", isAuthUser, getMyOrders);
route.get("/order/:orderId", isAuthUser, getOrderDetails);

// Admin Routes
// Admin Routes (use admin auth middleware)
route.get("/admin/all-orders", isAdminAuth, adminAllOrders);
route.get("/getAllOrders", isAdminAuth, adminAllOrders);
route.put("/admin/update/:orderId", isAdminAuth, AdminUpdateOrder);
route.put("/updateStatus/:orderId", isAdminAuth, AdminUpdateOrder);

module.exports = route;
