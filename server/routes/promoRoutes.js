const express = require("express");

const router = express.Router();

const { addPromo, getPromos, updatePromo } = require("../controllers/Promo");
const { applyPromoCode } = require("../controllers/promoCode");
const {
  validatePromoCode,
  validateGetPromos,
  validateApplyCode,
} = require("../validators/promoCodeValidator");
const { validateRequest } = require("../middleware/validateRequest");
const {
  verifyUserToken,
  verifyAdminToken,
} = require("../middleware/authMiddleware");
router.post(
  "/add-promo",
  verifyAdminToken,
  validatePromoCode,
  validateRequest,
  addPromo
);
router.get(
  "/get-promos",
  verifyAdminToken,
  validateGetPromos,
  validateRequest,
  getPromos
);
router.post(
  "/update-promo",
  verifyAdminToken,
  validatePromoCode,
  validateRequest,
  updatePromo
);
router.post(
  "/apply-promo-code",
  verifyUserToken,

  applyPromoCode
);

module.exports = router;
