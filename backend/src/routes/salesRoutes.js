const express = require("express");
const { getSalesHandler } = require("../controllers/salesController");

const router = express.Router();

router.get("/sales", getSalesHandler);

module.exports = router;
