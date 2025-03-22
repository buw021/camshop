const express = require("express");

const router = express.Router();

const {
  browseProducts,
  setProductOnSale,
  getSaleList,
  pauseSale,
  resumeSale,
  editSaleData,
} = require("../controllers/SaleProducts");

router.get("/browse-products", browseProducts);
router.get("/get-sale-list", getSaleList);

router.post("/set-product-on-sale", setProductOnSale);
router.post("/pause-sale", pauseSale);
router.post("/resume-sale", resumeSale);
router.post("/edit-sale-date", editSaleData);

module.exports = router;
