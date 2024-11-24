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

db.serialize(() => {
    // Existing entries table
    db.run(`
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);

    // New documents table for todo lists
    db.run(`
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            template_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);

    // New history table for tracking document changes
    db.run(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id)
        )
    `);
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
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