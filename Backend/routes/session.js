const express = require("express");

const router = express.Router();

const controller = require("../controllers/sessionController");

router.get("/", controller.getSessions);

router.post("/", controller.createSession);

router.patch("/:id", controller.renameSession);

router.delete("/:id", controller.deleteSession);


module.exports = router;
