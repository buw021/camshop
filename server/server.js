const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hashPassword } = require("./helpers/auth");

const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

//mongodb connection

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("DB connected");
  })
  .catch((err) => console.log("DB not connected", err));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//router connection
//Stripe Webhook
app.use("/", require("./routes/stripeRoutes"));
app.use(express.json());
//Routes
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/productRoutes"));
app.use("/", require("./routes/userRoutes"));
app.use("/", require("./routes/orderRoutes"));
app.use("/", require("./routes/orderRoutesAdmin"));
app.use("/", require("./routes/promoRoutes"));
app.use("/", require("./routes/saleRoutes"));
app.use("/", require("./routes/searchRoutes"));
app.use("/", require("./routes/customerRoutesAdmin"));
app.use("/", require("./routes/shippingRoutes"));
app.use("/", require("./routes/uploadRoutes"));
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

//admin
