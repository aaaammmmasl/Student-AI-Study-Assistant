const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const chatController = require("../controllers/chatController");

router.post("/chat", upload.array("files"), chatController.handleChat);

module.exports = router;
