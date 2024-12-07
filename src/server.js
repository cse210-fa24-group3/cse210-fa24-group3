const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// app.get('/bug-review', (req, res) => {
//     res.sendFile(path.join(__dirname, 'bug-review.html'));
// });
// Serve static files for frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});