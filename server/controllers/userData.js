const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword, decodeJWT } = require("../helpers/auth");
const { getUser } = require("../helpers/getUser");

const getUserData = async (req, res) => {
  const { usertoken } = req.cookies;
  try {
    const user = await getUser(usertoken);
    const { firstName, lastName, phoneNo, address, cart } = user;
    const userData = { firstName, lastName, phoneNo, address, cart };
    return res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserAddress = async (req, res) => {
  const { usertoken } = req.cookies;

  try {
    const user = await getUser(usertoken);
    const address = user.address;
    return res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { updatedAddress } = req.body;
  const addressId = updatedAddress._id;

  if (!updatedAddress || !addressId) {
    return res.status(400).json({ error: "Missing updated address or address ID" });
  }

  try {
    const user = await getUser(usertoken);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedAddresses = user.address.map((address) => 
      address._id.equals(addressId) ? updatedAddress : address
    );
    user.address = updatedAddresses;
    await user.save();
    return res.status(200).json({ message: "Addresses updated successfully", user });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: error.message });
  }
};


const saveNewAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { newAddress } = req.body;

  if (usertoken && newAddress) {
    try {
      const user = await getUser(usertoken);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.address.push(newAddress);
      await user.save();
      return res.status(200).json({ success: "success" });
    } catch (error) {
      console.error("Error saving new address:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Missing token or new address" });
  }
};

const deleteAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { addressId } = req.body;

  if (usertoken && addressId) {
    try {
      const user = await getUser(usertoken);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const updatedAddresses = user.address.filter(
        (address) => !address._id.equals(addressId)
      );
      user.address = updatedAddresses;
      await user.save();
      return res.status(200).json({ success: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Missing token or address ID" });
  }
}

const updateProfile = async (req, res) => {
  const { usertoken } = req.cookies;
  const { profile } = req.body;
  try {
    const user = await getUser(usertoken);
    user.firstName = profile.firstName;
    user.lastName = profile.lastName;
    user.phoneNo = profile.phoneNo;
    await user.save();
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const setDefaultAddress = async (req, res) => {
  const { usertoken } = req.cookies;
  const { addressId } = req.body;
  if (usertoken && addressId) {
    try {
      const user = await getUser(usertoken);
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
    try {
      const user = await getUser(usertoken);
      const match = await comparePassword(data.OldPassword, user.password);
      if (match) {
        const hashedPassword = await hashPassword(data.NewPassword);
        user.password = hashedPassword;
        await user.save();
        return res.json({ success: "Successfully changed password!" });
      } else {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Missing token or data" });
  }
};

module.exports = {
  getUserData,
  getUserAddress,
  updateAddress,
  deleteAddress,
  saveNewAddress,
  setDefaultAddress,
  updateProfile,
  changePassword,
};
