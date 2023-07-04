const express = require('express');
const UploadController = require('../src/controllers/upload');
const router = express.Router();
const multer = require('multer');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

const uploadController = new UploadController();

router.post('/image', upload.single('file'), uploadController.UploadImage);

module.exports = router;
