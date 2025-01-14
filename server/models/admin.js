const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
  username: String,
  password: String,
  role: { type: String, default: "admin" },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
