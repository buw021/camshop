const Stripe = require("stripe");
const STRIPE = new Stripe(process.env.STRIPE_SK);
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const Order = require("../models/orders");

const getAnalytics = async (req, res) => {
  try {
    /*  const paymentIntents = await STRIPE.paymentIntents.list({
      limit: 100,
    });

    const successful = paymentIntents.data.filter(
      (p) => p.status === "succeeded"
    );

    const totalRevenue = successful.reduce(
      (acc, p) => acc + p.amount_received,
      0
    );

    const monthlyStats = {};
    for (const payment of successful) {
      const date = new Date(payment.created * 1000);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyStats[month]) {
        monthlyStats[month] = 0;
      }
      monthlyStats[month] += payment.amount_received;
    } */

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: true,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          revenue: 1,
        },
      },
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: true,
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1
            ),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          revenue: 1,
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({ paymentStatus: true });

    const thisMonthOrders = await Order.countDocuments({
      paymentStatus: true,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });

    const lastMonthOrders = await Order.countDocuments({
      paymentStatus: true,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });
    //totalOrders this month, increase in order compared to last month

    const avgOrderValue = totalRevenue[0]?.total / totalOrders;

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          revenue: 1,
          orders: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
      { $limit: 12 },
    ]);

    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products", // your products collection name
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          totalSold: 1,
        },
      },
    ]);

    const current = thisMonthRevenue[0]?.revenue || 0;
    const past = lastMonthRevenue[0]?.revenue || 0;

    let growthRate = 0;

    if (past > 0) {
      growthRate = ((current - past) / past) * 100;
    } else if (past === 0 && current > 0) {
      growthRate = 100;
    } else {
      growthRate = 0;
    }

    const currentOrders = thisMonthOrders || 0;
    const pastOrders = lastMonthOrders || 0;

    let orderGrowthRate = 0;

    if (pastOrders > 0) {
      orderGrowthRate = ((currentOrders - pastOrders) / pastOrders) * 100;
    } else if (pastOrders === 0 && currentOrders > 0) {
      orderGrowthRate = 100;
    } else {
      orderGrowthRate;
    }

    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    res.json({
      totalRevenue: totalRevenue[0].total,
      thisMonthRevenue: thisMonthRevenue[0]?.revenue || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.revenue || 0,
      revenueGrowthRate: growthRate,
      totalOrders: totalOrders,
      thisMonthOrders: thisMonthOrders,
      lastMonthOrders: lastMonthOrders,
      orderGrowthRate: orderGrowthRate,
      avgOrderValue: avgOrderValue,
      monthlyRevenue: monthlyRevenue,
      topProducts: topProducts,
      orderStatusBreakdown: orderStatusBreakdown,
    });

    /*  res.json({
      totalRevenue: totalRevenue / 100, // in ₱ if you use PHP
      totalOrders: successful.length,
      avgOrderValue: totalRevenue / successful.length / 100,
      monthlyRevenue: Object.entries(monthlyStats).map(([month, amount]) => ({
        month,
        revenue: amount / 100,
      })),
    });  */
  } catch (err) {
    console.error("Stripe analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

module.exports = {
  getAnalytics,
};
