const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const quizController = require("../controllers/quizController");

router.post("/", upload.array("files"), quizController.handleQuiz);

module.exports = router;
