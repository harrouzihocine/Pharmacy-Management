const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set the directory where files will be uploaded
const uploadDir = path.join(__dirname, '../uploads');  // Adjust path as needed

// Check if the uploads directory exists, and create it if not
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the dynamically created 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Give a unique name to the file
    }
});

// Initialize Multer
const upload = multer({ storage });

module.exports = upload;
