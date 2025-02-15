const Shipping = require("../models/shipping");

const getShippingOptions = async (req, res) => {
  const { totalOrderCost } = req.query;
  try {
    let shippingOptions = await Shipping.find().select(
      "shippingType shippingCost shippingLabel shippingTime"
    );

    if (!shippingOptions) {
      return res.status(404).json({ error: "No shipping options found." });
    }

    if (totalOrderCost < 2000) {
      shippingOptions = shippingOptions.filter(
        (option) => option.shippingType !== "free"
      );
    } else {
      shippingOptions = shippingOptions.filter(
        (option) => option.shippingType !== "standard"
      );
    }

    res.json(shippingOptions);
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    res.status(500).json({ error: "Failed to fetch shipping options." });
  }
};

const getShippingOptionsA = async (req, res) => {
  try {
    let shippingOptions = await Shipping.find().select(
      "shippingType shippingCost shippingLabel shippingTime"
    );

    if (!shippingOptions) {
      return res.status(404).json({ error: "No shipping options found." });
    }

    res.json(shippingOptions);
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    res.status(500).json({ error: "Failed to fetch shipping options." });
  }
};

const updateShippingOptions = async (req, res) => {
  const { editShippingOption } = req.body;
  console.log(editShippingOption);
  const { shippingType, shippingCost, shippingLabel, shippingTime } =
    editShippingOption;
  try {
    const prevOption = await Shipping.findById(editShippingOption._id); // Use findById for a single document

    if (!prevOption) {
      return res.status(404).json({ error: "Shipping option not found." });
    }

    prevOption.shippingType = shippingType.toLowerCase();
    prevOption.shippingCost = shippingCost;
    prevOption.shippingLabel = shippingLabel.toLowerCase();
    prevOption.shippingTime = shippingTime.toLowerCase();

    await prevOption.save(); // Save the updated document
    res.json({ message: "Shipping options updated successfully." });
  } catch (error) {
    console.error("Error updating shipping options:", error);
    res.status(500).json({ error: "Failed to update shipping options." });
  }
};

const addShippingOption = async (req, res) => {
  const { newShippingOption } = req.body;
  const { shippingType, shippingCost, shippingLabel, shippingTime } =
    newShippingOption;
  try {
    const shippingOptions = await Shipping.find();
    if (shippingOptions.length >= 3)
      return res.json({ error: "Cannot add more than 3 shipping options." });

    const newSF = new Shipping({
      shippingType: shippingType.toLowerCase(),
      shippingCost,
      shippingLabel: shippingLabel.toLowerCase(),
      shippingTime: shippingTime.toLowerCase(),
    });

    await newSF.save(); // Save the new shipping option
    res.json({ message: "Shipping option added successfully." });
  } catch (error) {
    console.error("Error adding shipping option:", error);
    res.status(500).json({ error: "Failed to add shipping option." });
  }
};

module.exports = {
  getShippingOptions,
  updateShippingOptions,
  addShippingOption,
  getShippingOptionsA,
};
