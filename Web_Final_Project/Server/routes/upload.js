// routes/upload.js
const multer = require('multer');
const express = require('express');
const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: `${req.file.filename}` });
});

module.exports = router;
