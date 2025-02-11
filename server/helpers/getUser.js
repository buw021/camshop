const User = require("../models/user");
const { decodeJWT } = require("../helpers/auth");

const getUser = async (token) => {
  if (!token) return null;
  const userId = decodeJWT(token);
  const user = await User.findById(userId);
  return user;
};

module.exports = { getUser };
