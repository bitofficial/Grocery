const reviewsModel = require("../models/reviewsModel");
const sendError = require("../utils/sendError");

const addReviews = async (req, res) => {
  try {
    const { comment, ratings } = req.body;
    const isReviewsExist = reviewsModel.findOne({ user: req.user._id });
    if (isReviewsExist) {
      reviewsModel.findByIdAndUpdate(isReviewsExist._id, { comment, ratings });
      res.status(200).json({
        success: true,
        message: "Review Update..!!",
      });
    } else {
      const newReviews = reviewsModel.create({
        user: req.user._id,
        comment,
        ratings,
      });
      res.status(201).json({
        success: true,
        message: "Review Added..!!",
      });
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//get All Reviews fro client
const getAllReviews = async (req, res) => {
  try {
    const reviews = reviewsModel.find();
    const filteredReviews = reviews.filter((r) => r.ratings >= 3);
    const sortedReviews = filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      success: true,
      reviews: sortedReviews,
    });
  } catch (error) {
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//get all reviews fro admin
const AdminGetAllReviews = async (req, res) => {
  try {
    const reviews = reviewsModel.find();
    const sortedReviews = reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      success: true,
      reviews: sortedReviews,
    });
  } catch (error) {
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//Delete Product
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (reviewId) {
      const review = reviewsModel.findById(reviewId);
      if (review) {
        const deletedReview = reviewsModel.findByIdAndDelete(reviewId);
        res.status(200).json({
          success: true,
          message: "Review Delete SuccessFully..!!",
        });
      } else {
        sendError(res, 400, "Review Not Found");
      }
    } else {
      sendError(res, 400, "Review Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

module.exports = {
  addReviews,
  getAllReviews,
  getAllReviews,
  deleteReview,
  AdminGetAllReviews,
};
