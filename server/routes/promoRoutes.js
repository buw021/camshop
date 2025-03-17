const express = require("express");

const router = express.Router();

const { addPromo, getPromos, updatePromo } = require("../controllers/Promo");
const { applyPromoCode } = require("../controllers/promoCode");

router.post("/add-promo", addPromo);
router.get("/get-promos", getPromos);
router.post("/update-promo", updatePromo);
router.post("/apply-promo-code", applyPromoCode);

module.exports = router;
