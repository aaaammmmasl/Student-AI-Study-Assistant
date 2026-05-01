const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const pdfService = require("../services/pdfService");

// multiple files middleware
router.post("/chat", pdfService.uploadMiddleware, chatController.handleChat);

module.exports = router;
