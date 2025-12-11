const express = require('express');
const multer = require('multer');
const { db } = require('../config/firebase');

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Upload endpoint - saves image to Firestore as base64
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Generate unique ID for the image
    const imageId = `${Date.now()}-${req.file.originalname}`;
    
    // Store in Firestore
    await db.collection('menuImages').doc(imageId).set({
      dataUrl: dataUrl,
      mimeType: mimeType,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
      size: req.file.size,
    });

    console.log('Image saved to Firestore:', imageId);

    res.json({
      success: true,
      url: dataUrl,
      imageId: imageId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message,
    });
  }
});

module.exports = router;
