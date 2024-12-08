const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const fs = require('fs').promises;

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000', // or the exact URL of your frontend
    credentials: true
}));

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // or the exact URL of your frontend
    credentials: true
}));

// Serve static files
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname)));
app.use('/todo_template', express.static(path.join(__dirname, 'todo_template')));
app.use('/new-page', express.static(path.join(__dirname, 'new-page')));

// Database setup
const db = new sqlite3.Database('documents.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the documents database.');
    }
});
app.post('/api/documents', async (req, res) => {
    const { title, content, template_type = 'New Document' } = req.body;

    console.log('Received document creation request:', req.body);

    if (!title) {
        console.error('Title is required');
        return res.status(400).json({ error: 'Title is required' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    console.log('Generated document ID:', id);
    console.log('Current timestamp:', now);

    try {
        await runTransaction([
            {
                query: 'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                params: [id, title, content, template_type, now, now]
            }
        ]);

        console.log('Document successfully inserted');

        res.json({
            success: true,
            documentId: id,
            message: 'Document created successfully'
        });
    } catch (error) {
        console.error('Detailed document creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create document', 
            details: error.message,
            stack: error.stack 
        });
    }
});
// In your database initialization
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        template_type TEXT,
        created_at TEXT,
        updated_at TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating documents table:', err);
        } else {
            console.log('Documents table ensured');
        }
    });
});

// Utility function for database transactions
function runTransaction(queries) {
    return new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                return reject(err);
            }

            const runQuery = (query, params = []) => {
                return new Promise((queryResolve, queryReject) => {
                    db.run(query, params, function (err) {
                        if (err) {
                            console.error('Transaction query error:', err);
                            queryReject(err);
                        } else {
                            queryResolve(this);
                        }
                    });
                });
            };

            // Run all queries in sequence
            Promise.all(queries.map(q => runQuery(q.query, q.params)))
                .then(() => {
                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Commit error:', err);
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch((err) => {
                    db.run('ROLLBACK');
                    reject(err);
                });
        });
    });
}

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
// Add more detailed error logging to routes
app.get('/api/documents', (req, res) => {
    console.log('Received GET request for documents');
    db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ 
                error: 'Internal server error', 
                details: err.message 
            });
            return;
        }
        console.log('Fetched documents:', rows.length);
        res.json(rows);
    });
});
// Get single document
app.get('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error', details: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(row);
    });
});

// Create new document
app.post('/api/documents', async (req, res) => {
    const { title, content, template_type = 'New Document' } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
        await runTransaction([
            {
                query: 'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                params: [id, title, content, template_type, now, now]
            },
            {
                query: 'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                params: [id, now, now]
            }
        ]);

        res.json({
            success: true,
            documentId: id,
            message: 'Document created successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create document', details: error.message });
    }
});


// Update document route with better error handling
app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, template_type } = req.body;
    const now = new Date().toISOString();

    console.log('Received update request:', { id, title, content, template_type });

    // Check if document exists first
    db.get('SELECT * FROM documents WHERE id = ?', [id], (checkErr, existingDoc) => {
        if (checkErr) {
            console.error('Error checking document existence:', checkErr);
            return res.status(500).json({ 
                error: 'Database error', 
                details: checkErr.message 
            });
        }

        if (!existingDoc) {
            // If document doesn't exist, create a new one
            const newId = Date.now().toString();
            db.run(
                `INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [newId, title, content, template_type, now, now],
                function (insertErr) {
                    if (insertErr) {
                        console.error('Error creating new document:', insertErr);
                        return res.status(500).json({ 
                            error: 'Failed to create new document', 
                            details: insertErr.message 
                        });
                    }
                    res.json({
                        success: true,
                        documentId: newId,
                        message: 'New document created successfully'
                    });
                }
            );
            return;
        }

        // Update existing document
        db.run(
            `UPDATE documents SET title = ?, content = ?, template_type = ?, updated_at = ? WHERE id = ?`,
            [title, content, template_type, now, id],
            function (updateErr) {
                if (updateErr) {
                    console.error('Error updating document:', updateErr);
                    return res.status(500).json({ 
                        error: 'Failed to update document', 
                        details: updateErr.message 
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Document not found' });
                }

                res.json({ 
                    success: true, 
                    documentId: id,
                    message: 'Document updated successfully' 
                });
            }
        );
    });
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM documents WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).json({ error: 'Failed to delete document', details: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        res.json({ success: true, message: 'Document deleted successfully' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
