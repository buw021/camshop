const TextBanner = require("../models/textPromoBanner");

const addTextBanners = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text and start date are required." });
  }

  try {
    // Create a new TextBanner docum  ent
    /* const newTextBanner = new TextBanner({
      text: [{ text, active: true, startDate, endDate }],
    }); */
    let newTextBanner = await TextBanner.findOne();
    if (!newTextBanner) {
      newTextBanner = new TextBanner({ text: [{ text, active: true }] });
    } else {
      newTextBanner.text = [{ text, active: true }];
    }

    await newTextBanner.save();

    res
      .status(201)
      .json({ success: true, message: "Text banner added successfully." });
  } catch (error) {
    console.error("Error adding text banner:", error);
    res.status(500).json({ error: "Failed to add text banner." });
  }
};

const getTextBanners = async (req, res) => {
  try {
    const textBanners = await TextBanner.find();

    if (textBanners.length === 0) {
      return res.json();
    }

    return res.json(textBanners[0].text[0].text);
  } catch (error) {
    console.error("Error fetching text banners:", error);
    res.status(500).json({ error: "Failed to fetch text banners." });
  }
};

const deleteOldTextBanners = async (ids) => {
  try {
    const result = await TextBanner.deleteMany({ _id: { $in: ids } });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting old text banners:", error);
    return false;
  }
};

const updateTextBanners = async (req, res) => {
  const { text, active, startDate, endDate, id } = req.body;

  if (!text || !id) {
    return res.status(400).json({ error: "Text and ID are required." });
  }

  try {
    const textBanner = await TextBanner.findById(id);

    if (!textBanner) {
      return res.status(404).json({ error: "Text banner not found." });
    }

    // Update the text banner
    textBanner.text = [{ text, active, startDate, endDate }];
    await textBanner.save();

    res.json({ success: true, message: "Text banner updated successfully." });
  } catch (error) {
    console.error("Error updating text banner:", error);
    res.status(500).json({ error: "Failed to update text banner." });
  }
};

module.exports = {
  addTextBanners,
  getTextBanners,
};
