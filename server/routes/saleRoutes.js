const express = require("express");

const router = express.Router();

const {
  browseProducts,
  setProductOnSale,
  getSaleList,
  pauseSale,
} = require("../controllers/SaleProducts");

router.get("/browse-products", browseProducts);
router.get("/get-sale-list", getSaleList);

router.post("/set-product-on-sale", setProductOnSale);
router.post("/pause-sale", pauseSale);
module.exports = router;
