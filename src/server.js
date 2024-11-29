const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname)));
app.use('/todo template', express.static(path.join(__dirname, 'todo template')));
app.use('/new-page', express.static(path.join(__dirname, 'new-page')));

// Database setup
const db = new sqlite3.Database('documents.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the documents database.');
    }
});

// Initialize database with new schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        created_at TEXT,
        updated_at TEXT,
        template_type TEXT DEFAULT 'New Document'
    )`);
});

// Function to print database contents
function printDatabaseContents() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM entries', [], (err, rows) => {
            if (err) {
                console.error('Error fetching entries:', err);
                reject(err);
                return;
            }
            
            console.log('\n=== Current Database Contents ===');
            console.table(rows);
            console.log('================================\n');
            resolve(rows);
        });
    });
}

// Routes
app.get('/api/entries', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    // Modified to include todos in recent entries
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

app.post('/api/documents', async (req, res) => {
    const { title, content, template_type = 'New Document' } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    try {
        db.run(
            'INSERT INTO entries (id, title, content, created_at, updated_at, template_type) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, content, timestamp, timestamp, template_type],
            async function(err) {
                if (err) {
                    console.error('Database insertion error:', err);
                    return res.status(500).json({ 
                        error: 'Failed to create document', 
                        details: err.message 
                    });
                }
                
                await printDatabaseContents();
                res.status(201).json({ 
                    documentId: id,
                    message: 'Document created successfully'
                });
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            error: 'Unexpected server error', 
            details: error.message 
        });
    }
});


app.put('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const updated_at = new Date().toISOString();

    try {
        db.run(
            'UPDATE entries SET title = ?, content = ?, updated_at = ? WHERE id = ?',
            [title, content, updated_at, id],
            async function(err) {
                if (err) {
                    console.error('Database update error:', err);
                    return res.status(500).json({ 
                        error: 'Failed to update document', 
                        details: err.message 
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Document not found' });
                }
                
                await printDatabaseContents();
                res.json({ 
                    message: 'Document updated successfully',
                    documentId: id
                });
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            error: 'Unexpected server error', 
            details: error.message 
        });
    }
});

app.get('/api/todos', (req, res) => {
    let sql = 'SELECT * FROM entries WHERE template_type = "Todo" ORDER BY updated_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM entries WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(row);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

printDatabaseContents().catch(console.error);