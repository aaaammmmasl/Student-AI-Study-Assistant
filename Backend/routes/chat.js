const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const chatController = require("../controllers/chatController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, upload.array("files"), chatController.handleChat);

module.exports = router;
