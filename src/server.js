const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Database simulation
let bookings = [];
let users = [];
let spaces = [];
let tickets = [];

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// File upload setup
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpe?g|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG/PNG images are allowed'));
  }
});

// Helper function to save data
const saveData = () => {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify({
    bookings,
    users,
    spaces,
    tickets
  }, null, 2));
};

// Load initial data if exists
if (fs.existsSync(path.join(__dirname, 'db.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json')));
  bookings = data.bookings || [];
  users = data.users || [];
  spaces = data.spaces || [];
  tickets = data.tickets || [];
}

// Image Upload Endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file uploaded' 
      });
    }

    // Verify file was actually saved
    const filePath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not saved correctly');
    }

    res.json({ 
      success: true,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

// Users Endpoints
app.post('/users', (req, res) => {
  try {
    const newUser = {
      ...req.body,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveData();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [Keep all your other existing endpoints...]

// Static files
app.use('/uploads', express.static(uploadDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error' 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log('Endpoints:');
  console.log(`- POST   /upload`);
  console.log(`- POST   /users`);
  console.log(`- GET    /users`);
  console.log(`- PUT    /users/:id`);
  // [List all your other endpoints...]
});