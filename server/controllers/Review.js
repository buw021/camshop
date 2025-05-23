const Review = require("../models/reviews");
const Order = require("../models/orders");
const { getUser } = require("../helpers/getUser");
const { ObjectId } = require("mongodb");

const reviewProduct = async (req, res) => {
  const { usertoken } = req.cookies;
  const { reviews, orderId } = req.body;

  try {
    const user = await getUser(usertoken);
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.review) {
      return res.status(400).json({ message: "You have already reviewed" });
    }
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const reviewPromises = reviews.map(async (review) => {
      const { productId, variantId, rate, subject, message } = review;

      const newReview = new Review({
        userId: user.id,
        productId: productId,
        variantId: variantId,
        rating: rate,
        title: subject,
        message: message,
        orderId: orderId,
      });
      return newReview.save();
    });

    await Promise.all(reviewPromises);

    if (order) {
      order.review = true;
      await order.save();
    }
    return res.status(200).json({ message: "Reviews submitted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const updateReview = async (req, res) => {
  const { usertoken } = req.cookies;
  const { reviewId, ratingData } = req.body;
  const { rate, title, message } = ratingData;
  try {
    const user = await getUser(usertoken);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== user.id)
      return res.status(403).json({ message: "Forbidden" });

    if (review.edit) {
      return res
        .status(400)
        .json({ message: "You can only edit review one time" });
    }

    review.rating = rate;
    review.title = title;
    review.message = message;
    review.edit = true;
    review.updatedAt = Date.now();

    await review.save();
    return res.status(200).json({ message: "Review updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getUserReview = async (req, res) => {
  const { usertoken } = req.cookies;
  try {
    const user = await getUser(usertoken);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const page = req.query.page || 1;
    const limit = 10;
    const reviews = await Review.aggregate([
      { $match: { userId: ObjectId.createFromHexString(user.id) } }, // Ensure userId is in correct format
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" }, // Flatten the array since each review belongs to one order
      {
        $addFields: {
          matchingItem: {
            $filter: {
              input: "$order.items",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.productId", "$productId"] },
                  { $eq: ["$$item.variantId", "$variantId"] },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$matchingItem" }, // Ensure we only get the matched item
      {
        $project: {
          rating: 1,
          title: 1,
          message: 1,
          createdAt: 1,
          updatedAt: 1,
          edit: 1,
          productId: 1,
          variantId: 1,
          orderNumber: "$order.customOrderId",
          name: "$matchingItem.name",
          variantName: "$matchingItem.variantName",
          variantColor: "$matchingItem.variantColor",
          variantImg: "$matchingItem.variantImg",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    return res.status(200).json({ reviews, page, limit });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getProductReviews = async (req, res) => {
  const { productId, filter, sort, currentPage, limit } = req.query;
  try {
    const reviews = await Review.aggregate([
      {
        $match: {
          productId: ObjectId.createFromHexString(productId),
          ...(filter &&
            filter !== "all" && {
              rating: { $eq: parseInt(filter) },
            }),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $addFields: {
          matchingItem: {
            $filter: {
              input: "$order.items",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.productId", "$productId"] },
                  { $eq: ["$$item.variantId", "$variantId"] },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$matchingItem" },
      {
        $project: {
          rating: 1,
          title: 1,
          message: 1,
          createdAt: 1,
          updatedAt: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          name: "$matchingItem.name",
          variantName: "$matchingItem.variantName",
          variantColor: "$matchingItem.variantColor",
          variantImg: "$matchingItem.variantImg",
        },
      },
      { $sort: { createdAt: sort === "asc" ? 1 : -1 } },
      { $skip: (parseInt(currentPage) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    const totalReviews = await Review.countDocuments({
      productId: ObjectId.createFromHexString(productId),
    });

    const totalRating = await Review.aggregate([
      {
        $match: {
          productId: ObjectId.createFromHexString(productId),
        },
      },
      {
        $group: {
          _id: null,
          totalRating: { $sum: "$rating" },
        },
      },
    ]);

    const ratingCounts = await Review.aggregate([
      {
        $match: {
          productId: ObjectId.createFromHexString(productId),
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by rating in descending order
      },
    ]);

    // Ensure all ratings from 5 to 1 are present, default to 0 if not available
    const ratingCountsMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingCounts.forEach((rating) => {
      ratingCountsMap[rating._id] = rating.count;
    });

    const ratingCountsArray = Object.entries(ratingCountsMap).map(
      ([rating, count]) => ({
        rating: parseInt(rating),
        count,
      })
    );

    const averageRating =
      totalReviews > 0 ? totalRating[0]?.totalRating / totalReviews : 0;

    return res.status(200).json({
      reviews,
      currentPage,
      limit,
      totalReviews,
      averageRating,
      ratingCountsArray,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
module.exports = {
  reviewProduct,
  updateReview,
  getUserReview,
  getProductReviews,
};
