const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const sendError = require("../utils/sendError");

const newOrder = async (req, res) => {
  try {
    const { cartItems, shippingInfo, userId, total } = req.body;
    const newOrder = orderModel.create({
      user: userId,
      shippingInfo: shippingInfo,
      total: total,
      orderItems: cartItems,
      orderDate: new Date().toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "Processing",
    });
    await updateStock(cartItems);
    res.status(200).json({
      success: true,
      newOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
};

//update stock
const updateStock = (cartItems) => {
  cartItems.map((item) => {
    const product = productModel.findById(item.id);
    if (product) {
      product.stocks = product.stocks - item.quantity;
      productModel.findByIdAndUpdate(item.id, { stocks: product.stocks });
    }
  });
};

//Get Customer Orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (userId) {
      const orders = orderModel.find({ user: userId });
      const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json({
        success: true,
        message: "Orders Get SuccessFully",
        myOrders: sortedOrders,
      });
    } else {
      sendError(res, 400, "Invalid User Id ");
    }
  } catch (error) {
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

//Get Customer Order Details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (orderId) {
      const order = orderModel.findById(orderId);
      res.status(200).json({
        success: true,
        order,
      });
    } else {
      sendError(res, 400, "Invalid OrderId..!!");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

//get all orders admin
const adminAllOrders = async (req, res) => {
  try {
    const AllOrders = orderModel.find();
    const OrdersCount = AllOrders.length;
    const sortedOrders = AllOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      success: true,
      AllOrders: sortedOrders,
      OrdersCount,
      message: "All Orders Get SuccessFully..!!",
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

//Admin Update Order
const AdminUpdateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (orderId) {
      const updatedOrder = orderModel.findByIdAndUpdate(orderId, { status: req.body.oStatus });
      res.status(200).json({
        success: true,
        message: "Order Updated..!!",
        updatedOrder,
      });
    } else {
      sendError(res, 404, "Order Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went,s To Wrong..!!");
  }
};

module.exports = {
  newOrder,
  getMyOrders,
  getOrderDetails,
  adminAllOrders,
  AdminUpdateOrder,
};
