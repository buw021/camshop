const express = require("express");

const router = express.Router();
const { getUsers } = require("../controllers/Customers");

router.get("/get-users", getUsers);

module.exports = router;
