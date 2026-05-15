const express = require("express");
const router = express.Router();

const controller = require("../controllers/messageController");

router.post("/", controller.createMessage);
router.get("/:sessionId", controller.getMessagesBySession);

module.exports = router;
