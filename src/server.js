const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Path to the entries.json file
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
    db.run("CREATE TABLE entries (id TEXT PRIMARY KEY, title TEXT, content TEXT, created_at TEXT, updated_at TEXT)");
});

// Routes
app.get('/api/entries', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    let sql = 'SELECT * FROM entries ORDER BY updated_at DESC';
    if (limit) {
        sql += ` LIMIT ${limit}`;
    }
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/entries', (req, res) => {
    const { id, title, content, created_at, updated_at } = req.body;

    db.get('SELECT id FROM entries WHERE id = ?', [id], async (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.status(400).json({ error: 'Entry with the same ID already exists' });
            return;
        }

        db.run(
            'INSERT INTO entries (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [id, title, content, created_at, updated_at],
            async function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                try {
                    await exportToJson();
                    res.json({ id, message: 'Entry created successfully' });
                } catch (error) {
                    res.status(500).json({ message: 'Entry created in database but JSON export failed' });
                }
            }
        );
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Export entries to JSON
async function exportToJson() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM entries', [], async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                await fs.writeFile(ENTRIES_FILE, JSON.stringify(rows, null, 2));
                resolve();
            }
        });
    });
}
app.get('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM entries WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(row);
    });
});
