const productModel = require("../models/productModel");
const coludinary = require("cloudinary");
const sendError = require("../utils/sendError");
const { filterData } = require("../utils/filterQuery");

//Add Product
const addProduct = async (req, res) => {
  try {
    const { name, rate, stocks, category, kilogramOption, image } = req.body;
    if (kilogramOption.length == 1) {
      sendError(res, 400, ["Weight: Required..!!"]);
    } else {
      const kgOption = [];
      kilogramOption.map((kg) => {
        kgOption.push(kg);
      });

      const result = await coludinary.v2.uploader.upload(image, {
        folder: "products",
      });

      const newProduct = productModel.create({
        name,
        rate,
        stocks,
        category,
        kilogramOption: kgOption,
        public_id: result.public_id,
        url: result.url,
      });

      res.status(201).json({
        success: true,
        message: "Product Add SuccessFully..!!",
        newProduct,
      });
    }
  } catch (error) {
    sendError(res, 400, ["Somethings Went Wrong..!!"]);
  }
};

//Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (productId) {
      const isProductExit = productModel.findById(productId);
      if (isProductExit) {
        const DeletedProduct = productModel.findByIdAndDelete(productId);
        res.status(200).json({
          success: true,
          message: "Product Delete SuccessFully..!!",
          DeletedProduct,
        });
      } else {
        sendError(res, 400, "Product Not Found");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//Update Products
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rate, kilogramOption, category, stocks, image } = req.body;
    if (productId) {
      const isProductExit = productModel.findById(productId);
      if (image !== "") {
        const result = await coludinary.v2.uploader.upload(image, {
          folder: "products",
        });
        productModel.findByIdAndUpdate(productId, {
          url: result.url,
          public_id: result.public_id,
          name: name,
          rate: rate,
          category: category,
          stocks: stocks,
          kilogramOption: kilogramOption,
        });
        res.status(200).json({
          success: true,
          message: "Product Updated..!!",
        });
      } else {
        productModel.findByIdAndUpdate(productId, {
          name: name,
          rate: rate,
          category: category,
          stocks: stocks,
          kilogramOption: kilogramOption,
        });
        res.status(200).json({
          success: true,
          message: "Product Updated..!!",
        });
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Retrieve All Products
const getAllProduct = async (req, res) => {
  try {
    // `productModel` is a file-based DB object where `find()` returns an
    // array of products. `filterData` expects an object with a `.find()`
    // method that accepts a query (like the DB object), so pass the
    // `productModel` itself to `filterData` and use the returned array.
    const allProducts = productModel.find();
    const productsDocCount = allProducts.length;
    const products = filterData(productModel, req.query);
    res.status(200).json({
      success: true,
      message: "Product Retrieve SuccessFully..!!",
      products: products,
      productsDocCount,
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Retrieve First Five Products
const getRecentProducts = async (req, res) => {
  try {
    const allProducts = productModel.find();
    const products = allProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    sendError(res, 400, "Something Is Wrong..!!");
  }
};

//Retrieve Single Product
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (productId) {
      const product = productModel.findById(productId);

      if (product) {
        res.status(200).json({
          success: true,
          message: "Product Retrieve SuccessFully..!!",
          product,
        });
      } else {
        sendError(res, 400, "Product Not Found..!!");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProduct,
  getRecentProducts,
  getSingleProduct,
};
