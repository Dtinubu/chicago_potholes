const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser'); // For parsing CSV data

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Store pothole data in an array
let potholes = [];

// Load pothole data from a CSV file (or JSON if available)
fs.createReadStream(path.join(__dirname, 'potholes.csv')) // Update the path to the CSV file
  .pipe(csv())
  .on('data', (data) => potholes.push(data))
  .on('end', () => {
    console.log('Pothole data loaded:', potholes.length);
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });

// API to get nearby potholes based on user’s location
app.get('/api/potholes', (req, res) => {
    const { lat, lon } = req.query; // Get latitude and longitude from the query string
    
    const radius = 0.01; // Define a radius for pothole detection, e.g., ~1km
    
    // Filter potholes within the radius of the user's location
    const nearbyPotholes = potholes.filter(pothole => {
        const potholeLat = parseFloat(pothole.LATITUDE); // Ensure you use the correct key for latitude
        const potholeLon = parseFloat(pothole.LONGITUDE); // Ensure you use the correct key for longitude

        // Check if the pothole is within the radius
        const isNearby = Math.abs(potholeLat - lat) <= radius && Math.abs(potholeLon - lon) <= radius;
        return isNearby;
    });

    // Send back the nearby potholes
    res.json({ nearbyPotholes });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
