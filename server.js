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

  // Ensure the uploads directory exists
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
  }

  // Save the image to the uploads folder
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).json({ error: 'Failed to save image.' });
    }

    // Return the preview link instead of the direct image link
    const previewLink = `https://newback-h9lo.onrender.com/preview/${randomFilename}.png`;
    res.json({ link: previewLink });
  });
});

// Serve the preview page with Open Graph meta tags
app.get('/preview/:filename', (req, res) => {
  const { filename } = req.params;
  const imageUrl = `https://newback-h9lo.onrender.com/uploads/${filename}`;

  // HTML with Open Graph meta tags
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Look what I shared with you!" />
        <meta property="og:description" content="Check out this awesome image I created!" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="https://newback-h9lo.onrender.com/preview/${filename}" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Look what I shared with you!" />
        <meta property="twitter:description" content="Check out this awesome image I created!" />
        <meta property="twitter:image" content="${imageUrl}" />
      </head>
      <body>
        <img src="${imageUrl}" alt="Shared Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `;

  res.send(html);
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
