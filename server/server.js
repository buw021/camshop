const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hashPassword } = require("./helpers/auth");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { setIO } = require("./helpers/socket");

const app = express();
const port = 3000;
const server = http.createServer(app);
//mongodb connection

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.0.6:5173"],
    credentials: true,
  },
});

setIO(io);

// 🔌 When a client connects
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("DB connected");
  })
  .catch((err) => console.log("DB not connected", err));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.6:5173"],
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
app.use("/", require("./routes/analyticsRoutes"));
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/bannerRoutes"));
app.use("/", require("./routes/productRoutes"));
app.use("/", require("./routes/userRoutes"));
app.use("/", require("./routes/notificationRoutes"));
app.use("/", require("./routes/orderRoutes"));
app.use("/", require("./routes/orderRoutesAdmin"));
app.use("/", require("./routes/promoRoutes"));
app.use("/", require("./routes/saleRoutes"));
app.use("/", require("./routes/searchRoutes"));
app.use("/", require("./routes/customerRoutesAdmin"));
app.use("/", require("./routes/shippingRoutes"));
app.use("/", require("./routes/reviewRoutes"));
app.use("/", require("./routes/uploadRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

server.listen(port, () => {
  console.log(`🚀 Server and WebSocket running on http://localhost:${port}`);
});

//admin
