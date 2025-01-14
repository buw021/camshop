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
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//router connection
app.use("/", require("./routes/authRoutes"));

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

//admin

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PS;
  const hashedPassword = await hashPassword(password);

  const newAdmin = new Admin({
    username,
    password: hashedPassword,
    role: "admin",
  });

  await newAdmin.save();
  console.log("Admin created");
}

/*createAdmin().catch((err) => console.error(err));*/
