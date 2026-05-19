const express = require("express");
const router = express.Router();

const controller = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.post("/", controller.createMessage);
router.get("/:sessionId", controller.getMessagesBySession);

module.exports = router;
