const express = require("express");
const {
  search,
  suggest,
  adminProductSearch,
} = require("../controllers/search");
const { getFilters } = require("../controllers/Filter");

const router = express.Router();

router.get("/search", search);
router.get("/suggest", suggest);
router.get("/search-products", adminProductSearch);
router.get("/getFilters", getFilters);

module.exports = router;
