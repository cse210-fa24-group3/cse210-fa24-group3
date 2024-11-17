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

// Serve static files from the src directory
app.use(express.static(path.join(__dirname)));

// Path to the entries.json file
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'devlog.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create entries table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS entries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);
    }
});

// Helper function to export DB entries to JSON
async function exportToJson() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM entries ORDER BY created_at DESC', [], async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                await fs.writeFile(ENTRIES_FILE, JSON.stringify(rows, null, 2));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

// API Routes
// Get all entries
app.get('/api/entries', (req, res) => {
    db.all('SELECT * FROM entries ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single entry
app.get('/api/entries/:id', (req, res) => {
    db.get('SELECT * FROM entries WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Entry not found' });
            return;
        }
        res.json(row);
    });
});

// Create new entry
app.post('/api/entries', (req, res) => {
    const { id, title, content, created_at, updated_at } = req.body;
    db.run(
        'INSERT INTO entries (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, title, content, created_at, updated_at],
        async function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            // Export to JSON after successful insert
            try {
                await exportToJson();
                res.json({ id, message: 'Entry created successfully' });
            } catch (error) {
                console.error('Error exporting to JSON:', error);
                // Still return success since DB operation worked
                res.json({ id, message: 'Entry created successfully (JSON export failed)' });
            }
        }
    );
});

// Update entry
app.put('/api/entries/:id', (req, res) => {
    const { title, content, updated_at } = req.body;
    db.run(
        'UPDATE entries SET title = ?, content = ?, updated_at = ? WHERE id = ?',
        [title, content, updated_at, req.params.id],
        async function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Entry not found' });
                return;
            }
            // Export to JSON after successful update
            try {
                await exportToJson();
                res.json({ message: 'Entry updated successfully' });
            } catch (error) {
                console.error('Error exporting to JSON:', error);
                // Still return success since DB operation worked
                res.json({ message: 'Entry updated successfully (JSON export failed)' });
            }
        }
    );
});

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
    db.run('DELETE FROM entries WHERE id = ?', [req.params.id], async function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Entry not found' });
            return;
        }
        // Export to JSON after successful delete
        try {
            await exportToJson();
            res.json({ message: 'Entry deleted successfully' });
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            // Still return success since DB operation worked
            res.json({ message: 'Entry deleted successfully (JSON export failed)' });
        }
    });
});

// Export entries to JSON file manually
app.post('/api/export', async (req, res) => {
    try {
        await exportToJson();
        res.json({ message: 'Entries exported to JSON successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import entries from JSON file
app.post('/api/import', async (req, res) => {
    try {
        const jsonData = await fs.readFile(ENTRIES_FILE, 'utf8');
        const entries = JSON.parse(jsonData);
        
        // Begin transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Clear existing entries
            db.run('DELETE FROM entries', [], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                // Insert all entries from JSON
                const stmt = db.prepare('INSERT INTO entries (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
                
                entries.forEach((entry) => {
                    stmt.run([entry.id, entry.title, entry.content, entry.created_at, entry.updated_at]);
                });
                
                stmt.finalize();
                
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ message: 'Entries imported successfully' });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve editor.html for the editor route
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'new-page', 'editor.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});