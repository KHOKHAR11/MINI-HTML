// Command: npm install express cors
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors()); // Allows your website to fetch data

const SESSION_PATH = './sessions'; // Path to your sessions folder

app.get('/code', (req, res) => {
    let botCount = 28; // Default value

    try {
        if (fs.existsSync(SESSION_PATH)) {
            const files = fs.readdirSync(SESSION_PATH);
            // Counts only folders/files (excluding hidden ones)
            botCount = files.filter(file => !file.startsWith('.')).length;
        }
    } catch (err) {
        console.error("Error reading sessions:", err);
    }

    // This sends the data to your website
    res.json({
        count: botCount,
        status: "Active"
    });
});

// Use Heroku's dynamic port or 3000 for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Service running on port ${PORT}`));
