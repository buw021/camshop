const express = require("express");

const router = express.Router();

const {
  browseProducts,
  setProductOnSale,
  getSaleList,
  pauseSale,
  resumeSale,
  editSaleData,
  saveNewSaleData,
} = require("../controllers/SaleProducts");
const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  validateGetSaleList,
  validateSale,
  validateSaleID,
  validateNewSaleData,
} = require("../validators/saleProductValidatorAdmin");
const { validateRequest } = require("../middleware/validateRequest");
router.get("/browse-products", verifyAdminToken, browseProducts);
router.get(
  "/get-sale-list",
  verifyAdminToken,
  validateGetSaleList,
  validateRequest,
  getSaleList
);

router.post(
  "/set-product-on-sale",
  verifyAdminToken,
  validateSale,
  validateRequest,
  setProductOnSale
);
router.post(
  "/pause-sale",
  verifyAdminToken,
  validateSaleID,
  validateRequest,
  pauseSale
);
router.post(
  "/resume-sale",
  verifyAdminToken,
  validateSaleID,
  validateRequest,
  resumeSale
);
router.post(
  "/save-new-sale-data",
  verifyAdminToken,
  validateNewSaleData,
  validateRequest,
  saveNewSaleData
);

module.exports = router;
