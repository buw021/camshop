const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");

const getUserData = async (req, res) => {
  const { usertoken } = req.cookies;
  try {
    const userId = decodeJWT(usertoken);
    const user = await User.findById(userId);
    const { firstName, lastName, phoneNo, address, cart } = user;
    const userData = { firstName, lastName, phoneNo, address, cart };
    return res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { updatedAddresses } = req.body;
  try {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id);
    user.address = updatedAddresses;
    await user.save();
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { usertoken } = req.cookies;
  const { profile } = req.body;
  try {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id);
    user.firstName = profile.firstName;
    user.lastName = profile.lastName;
    user.phoneNo = profile.phoneNo;
    await user.save();
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveNewAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { newAddress } = req.body;

  if (usertoken && newAddress) {
    try {
      const id = decodeJWT(usertoken);
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.address.push(newAddress);
      await user.save();
      return res.json({ success: "success" });
    } catch (error) {
      console.error("Error saving new address:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Missing token or new address" });
  }
};

const setDefaultAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { addressId } = req.body;
  if (usertoken && addressId) {
    try {
      const id = decodeJWT(usertoken);
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.address.forEach((address) => {
        address.default = address._id.equals(addressId);
      });
      await user.save();
      const sortedAddresses = user.address.sort((a, b) => {
        if (a.default) return -1;
        if (b.default) return 1;
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      });
      return res.json({
        success: "Address set as default",
        addresses: sortedAddresses,
      });
    } catch (error) {
      console.error("Error setting default address:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Missing token or address ID" });
  }
};

const changePassword = async (req, res) => {
  const { usertoken } = req.cookies;
  const { data } = req.body;

  if (data && usertoken) {
    const id = decodeJWT(usertoken);
    const user = await User.findById(id).select("password");
    const match = await comparePassword(data.OldPassword, user.password);
    if (match) {
      const hashedPassword = await hashPassword(data.NewPassword);
      console.log(hashedPassword);
      user.password = hashedPassword;
      await user.save();
      return res.json({ success: "Successfully changed password!" });
    }
  }
};

module.exports = {
  getUserData,
  updateAddress,
  saveNewAddress,
  setDefaultAddress,
  updateProfile,
  changePassword,
};
