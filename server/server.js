const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { mongoose } = require("mongoose");

const bcrypt = require("bcrypt");
const { hashPassword } = require("./helpers/auth");

const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

//mongodb connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("db connceted"))
  .catch((err) => console.log("db not connecteed", err));

//middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//router connection
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/orderRoutes"));
app.use("/", require("./routes/promoRoutes"));
app.use("/", require("./routes/saleRoutes"));

app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

//admin
