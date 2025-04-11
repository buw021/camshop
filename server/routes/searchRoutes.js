const express = require("express");
const {
  search,
  suggest,
  adminProductSearch,
} = require("../controllers/search");
const { getFilters } = require("../controllers/Filter");
const {
  validateQuery,
  validateProductSearchAdmin,
} = require("../validators/searchValidator");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.get("/search", validateQuery, validateRequest, search);
router.get("/suggest", validateQuery, validateRequest, suggest);
router.get(
  "/search-products",
  validateProductSearchAdmin,
  validateRequest,
  adminProductSearch
);
router.get("/getFilters", getFilters);

module.exports = router;
