const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080; // Use environment variable for port

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the uploads folder as a static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Utility function to generate random strings
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Upload endpoint
app.post('/upload', (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image is required.' });
  }

  // Generate a random filename
  const randomFilename = generateRandomString(10);
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = path.join(__dirname, 'uploads', `${randomFilename}.png`);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).json({ error: 'Failed to save image.' });
    }

    // Use Render domain for the link
    const link = `https://newback-h9lo.onrender.com/uploads/${randomFilename}.png`;
    res.json({ link });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend is running on https://newback-h9lo.onrender.com`);
});
