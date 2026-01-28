// Command: node api.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());

// Folder where your sessions are stored
const SESSION_PATH = './sessions';

app.get('/api/bot-stats', (req, res) => {
    if (!fs.existsSync(SESSION_PATH)) {
        return res.json({ active: 0, limit: 50 });
    }

    fs.readdir(SESSION_PATH, (err, files) => {
        if (err) return res.status(500).json({ error: "Folder error" });
        
        // Count only session files/folders
        const count = files.length;
        res.json({ active: count, limit: 50 });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Stats API running on port ${PORT}`));
