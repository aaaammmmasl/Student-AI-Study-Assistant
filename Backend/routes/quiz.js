const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");

router.post("/quiz", quizController.handleQuiz);

module.exports = router;
