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
// app.use(express.static(path.join(__dirname)));
app.use(express.static(__dirname));

console.log('Server running from directory:', __dirname);

// Path to the entries.json file
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
    db.run("CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT, content TEXT, template_type TEXT, created_at TEXT, updated_at TEXT)");
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

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


// API Routes
// Get all entries
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

// Get all documents
app.get('/api/documents', (req, res) => {
    db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single document
app.get('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    console.log('Fetching document:', id);
    
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.log('Document not found:', id);
            return res.status(404).json({ error: 'Document not found' });
        }
        console.log('Found document:', row);
        res.json(row);
    });
});

// Create new document
app.post('/api/documents', (req, res) => {
    console.log('Received POST request for document:', req.body);
    const { title, content, template_type } = req.body;
    const id = Date.now().toString(); // Generate unique ID
    const now = new Date().toISOString();

    db.serialize(() => {
        console.log('Starting document creation transaction');
        
        db.run('BEGIN TRANSACTION');

        // Insert into documents table
        db.run(
            'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, content, template_type, now, now],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Insert into history table
                db.run(
                    'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                    [id, now, now],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: err.message });
                            return;
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            res.json({ 
                                success: true, 
                                documentId: id,
                                message: 'Document created successfully' 
                            });
                        });
                    }
                );
            }
        );
    });
});

app.post('/api/documents/new-todo', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new todo document...');

    const emptyTodo = {
        title: "Untitled Todo List",
        content: JSON.stringify({
            tasks: [],
            lastUpdated: now
        }),
        template_type: 'todo'
    };

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, emptyTodo.title, emptyTodo.content, emptyTodo.template_type, now, now],
            function(err) {
                if (err) {
                    console.error('Document creation error:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ 
                        success: false, 
                        error: err.message 
                    });
                }

                db.run(
                    'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                    [id, now, now],
                    function(err) {
                        if (err) {
                            console.error('History creation error:', err);
                            db.run('ROLLBACK');
                            return res.status(500).json({ 
                                success: false, 
                                error: err.message 
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Commit error:', err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ 
                                    success: false, 
                                    error: err.message 
                                });
                            }
                            
                            console.log('Todo created successfully with ID:', id);
                            return res.status(200).json({ 
                                success: true, 
                                documentId: id,
                                message: 'Todo created successfully'
                            });
                        });
                    }
                );
            }
        );
    });
});

// Update document
app.put('/api/documents/:id', (req, res) => {
    const { title, content } = req.body;
    const now = new Date().toISOString();

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Update documents table
        db.run(
            'UPDATE documents SET title = ?, content = ?, updated_at = ? WHERE id = ?',
            [title, content, now, req.params.id],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }

                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    res.status(404).json({ error: 'Document not found' });
                    return;
                }

                // Modified: Include created_at in history insert
                db.run(
                    'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                    [req.params.id, now, now], // Added now as created_at
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: err.message });
                            return;
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            res.json({ 
                                success: true, 
                                message: 'Document updated successfully' 
                            });
                        });
                    }
                );
            }
        );
    });
});

db.run(`
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id)
    )
`);



// Serve todo.html for the todo route
app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'todo.html'));
});


// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve editor.html for the editor route
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'new-page', 'editor.html'));
});

app.get('/todo/:id', (req, res) => {
    console.log('Loading todo with ID:', req.params.id);
    // Use absolute path to todo.html
    const todoPath = path.join(__dirname, 'todo.html');
    console.log('Serving file from:', todoPath); // Debug log
    res.sendFile(todoPath);
});

app.get('/todo', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

app.get('/journal', (req, res) => {
    res.sendFile(path.join(__dirname, 'journal.html'));
});

app.get('/journal/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'journal.html'));
});

// Bug Review
app.get('/bug-review', (req, res) => {
    res.sendFile(path.join(__dirname, 'bug-review.html'));
});

app.get('/bug-review/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'bug-review.html'));
});

app.post('/api/documents/new-bug-review', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new bug review document...');

    const emptyBugReview = {
        title: "Untitled Bug Review",
        content: JSON.stringify({
            tasks: [],
            lastUpdated: now
        }),
        template_type: 'bug-review'
    };

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, emptyBugReview.title, emptyBugReview.content, emptyBugReview.template_type, now, now],
            function(err) {
                if (err) {
                    console.error('Document creation error:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ 
                        success: false, 
                        error: err.message 
                    });
                }

                db.run(
                    'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                    [id, now, now],
                    function(err) {
                        if (err) {
                            console.error('History creation error:', err);
                            db.run('ROLLBACK');
                            return res.status(500).json({ 
                                success: false, 
                                error: err.message 
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Commit error:', err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ 
                                    success: false, 
                                    error: err.message 
                                });
                            }
                            
                            console.log('Bug review created successfully with ID:', id);
                            return res.status(200).json({ 
                                success: true, 
                                documentId: id,
                                message: 'Bug review created successfully'
                            });
                        });
                    }
                );
            }
        );
    });
});
