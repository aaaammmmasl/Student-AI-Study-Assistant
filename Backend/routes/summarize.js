const express = require("express");
const router = express.Router();
const summarizeController = require("../controllers/summarizeController");

router.post("/summarize", summarizeController.summarizeText);

module.exports = router;