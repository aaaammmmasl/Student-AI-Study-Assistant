const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const quizController = require("../controllers/quizController");

// 👇 هذا هو المهم
router.post("/quiz", upload.array("files"), quizController.handleQuiz);

module.exports = router;
