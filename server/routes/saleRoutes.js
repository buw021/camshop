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

router.get("/browse-products", browseProducts);
router.get("/get-sale-list", getSaleList);

router.post("/set-product-on-sale", setProductOnSale);
router.post("/pause-sale", pauseSale);
router.post("/resume-sale", resumeSale);
router.post("/save-new-sale-data", saveNewSaleData);

module.exports = router;
