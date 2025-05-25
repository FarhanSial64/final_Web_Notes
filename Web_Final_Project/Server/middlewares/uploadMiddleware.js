const multer = require('multer');
const path = require('path');

// Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination folder for uploaded files
    cb(null, 'uploads/users');
  },
  filename: (req, file, cb) => {
    // Define the filename (with original name and timestamp for uniqueness)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname); // Get file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// Check if file is an image (can be extended for other formats)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extname && mimeType) {
    return cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed.'));
  }
};

// Initialize Multer with storage settings and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max file size: 5MB
});

module.exports = upload;
