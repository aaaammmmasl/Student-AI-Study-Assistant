const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");
const pdfService = require("../services/pdfService");

router.post(
  "/upload-pdf",
  pdfService.uploadMiddleware,
  uploadController.uploadPDF,
);

module.exports = router;
