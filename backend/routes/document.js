const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const documentController = require('../controllers/documentController');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Route for document upload
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// Route for document analysis
router.post('/analyze', documentController.analyzeDocument);

// Route for asking questions about documents
router.post('/question', documentController.answerQuestion);

module.exports = router;