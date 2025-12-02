const categoryModel = require("../models/categoryModel");
const coludinary = require("cloudinary");
const sendError = require("../utils/sendError");

//Add Category
const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage } = req.body;

    const isCategoryExist = categoryModel.findOne({
      categoryName: categoryName,
    });
    if (isCategoryExist) {
      sendError(res, 400, "Category Already Exist..!!");
    } else {
      const result = await coludinary.v2.uploader.upload(categoryImage, {
        folder: "category",
      });
      const newCategory = categoryModel.create({
        categoryName,
        categoryImage: result.url,
      });
      res.status(201).json({
        success: true,
        message: "Category Added..!!",
        newCategory,
      });
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//get all categories
const getAllCategories = async (req, res) => {
  try {
    const Categories = categoryModel.find();
    const CategoriesCount = Categories.length;
    // Return categories even if empty to avoid 400 on client-side when none exist
    res.status(200).json({
      success: true,
      Categories,
      CategoriesCount,
      message: "Categories retrieved successfully..!!",
    });
  } catch (error) {
    sendError(res, 400, "Something Went To Wrong..!!");
  }
};

//delete category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (categoryId) {
      const isCategoryExist = categoryModel.findById(categoryId);
      if (isCategoryExist) {
        const DeletedCategory = categoryModel.findByIdAndDelete(
          categoryId
        );
        res.status(200).json({
          success: true,
          message: "Category Delete SuccessFully..!!",
          DeletedCategory,
        });
      } else {
        sendError(res, 400, "Category Not Found");
      }
    } else {
      sendError(res, 400, "Category Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, "Something Went's Wrong..!!");
  }
};

//Update Category
const updateCategory = async (req, res) => {
  try {
    if (req.params.categoryId) {
      const category = categoryModel.findById(req.params.categoryId);
      if (req.body.categoryImage !== "") {
        const { categoryImage } = req.body;

        const result = await coludinary.v2.uploader.upload(categoryImage, {
          folder: "category",
        });
        categoryModel.findByIdAndUpdate(req.params.categoryId, {
          categoryImage: result.url,
          categoryName: req.body.categoryName,
        });
        res.status(200).json({
          success: true,
          message: "Category Updated..!!",
        });
      } else {
        categoryModel.findByIdAndUpdate(req.params.categoryId, {
          categoryName: req.body.categoryName,
        });
        res.status(200).json({
          success: true,
          message: "Category Updated..!!",
        });
      }
    } else {
      sendError("Category Id Required..!!");
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's To Wrong..!!");
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
};
