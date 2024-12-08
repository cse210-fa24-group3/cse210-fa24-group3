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

// Serve static files from the directories
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

// Initialize database schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY, 
        title TEXT, 
        content TEXT, 
        template_type TEXT, 
        created_at TEXT, 
        updated_at TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id)
    )`);
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
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
    const { title, content, template_type = 'New Document' } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

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

// Update document
app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const now = new Date().toISOString();

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Update documents table
        db.run(
            'UPDATE documents SET title = ?, content = ?, updated_at = ? WHERE id = ?',
            [title, content, now, id],
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

                // Insert into history
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
                                message: 'Document updated successfully' 
                            });
                        });
                    }
                );
            }
        );
    });
});



// Delete document
app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;

    console.log('Received DELETE request for document:', id);

    // Basic validation
    if (!id) {
        return res.status(400).json({ success: false, message: 'Document ID is required.' });
    }

    db.serialize(() => {
        console.log('Starting document deletion transaction');

        db.run('BEGIN TRANSACTION');

        // Delete related history entries first to maintain referential integrity
        db.run(
            'DELETE FROM history WHERE document_id = ?',
            [id],
            function(err) {
                if (err) {
                    console.error('Error deleting history:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, message: 'Failed to delete document history.' });
                }

                // Delete the document
                db.run(
                    'DELETE FROM documents WHERE id = ?',
                    [id],
                    function(err) {
                        if (err) {
                            console.error('Error deleting document:', err);
                            db.run('ROLLBACK');
                            return res.status(500).json({ success: false, message: 'Failed to delete document.' });
                        }

                        if (this.changes === 0) {
                            db.run('ROLLBACK');
                            return res.status(404).json({ success: false, message: 'Document not found.' });
                        }

                        // Commit the transaction
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ success: false, message: 'Failed to delete document.' });
                            }

                            console.log('Document deleted successfully:', id);
                            res.json({ success: true, message: 'Document deleted successfully.' });
                        });
                    }
                );
            }
        );
    });
});



// Special routes for specific document types
app.post('/api/documents/new-todo', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new todo document...');

    const emptyTodo = {
        title: "",
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

app.post('/api/documents/new-bug-review', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new bug review document...');

    const emptyBugReview = {
        title: "",
        content: JSON.stringify({
            text: '',
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

app.get(['/todo_template/todo.html'], (req, res) => {
    const todoTemplatePath = path.join(__dirname, 'todo_template', 'todo.html');
    console.log('Attempting to serve todo_template');
    console.log('Full path:', todoTemplatePath);
    
    // Use fs to check if file exists before sending
    fs.access(todoTemplatePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Todo template file not found:', err);
            return res.status(404).send('Todo template not found');
        }
        res.sendFile(todoTemplatePath);
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'new-page', 'editor.html'));
});



app.get('/journal', (req, res) => {
    res.sendFile(path.join(__dirname, 'journal.html'));
});

app.get('/journal/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'journal.html'));
});

app.get('/bug-review', (req, res) => {
    res.sendFile(path.join(__dirname, 'bug-review.html'));
});

app.get('/bug-review/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'bug-review.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Feature
app.get('/feature', (req, res) => {
    res.sendFile(path.join(__dirname, 'feature.html'));
});

app.get('/feature/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'feature.html'));
});

app.post('/api/documents/new-feature', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new feature document...');

    const emptyFeature = {
        title: "",
        content: JSON.stringify({
            text: '',
            lastUpdated: now
        }),
        template_type: 'feature'
    };

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, emptyFeature.title, emptyFeature.content, emptyFeature.template_type, now, now],
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
                            
                            console.log('Feature created successfully with ID:', id);
                            return res.status(200).json({ 
                                success: true, 
                                documentId: id,
                                message: 'Feature created successfully'
                            });
                        });
                    }
                );
            }
        );
    });
});

// Meeting
app.get('/meeting', (req, res) => {
    res.sendFile(path.join(__dirname, 'meeting.html'));
});

app.get('/meeting/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'meeting.html'));
});

app.post('/api/documents/new-meeting', (req, res) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    console.log('Creating new meeting document...');

    const emptyMeeting = {
        title: "",
        content: JSON.stringify({
            text: '',
            lastUpdated: now
        }),
        template_type: 'meeting'
    };

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, emptyMeeting.title, emptyMeeting.content, emptyMeeting.template_type, now, now],
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
                            
                            console.log('Meeting created successfully with ID:', id);
                            return res.status(200).json({ 
                                success: true, 
                                documentId: id,
                                message: 'Meeting created successfully'
                            });
                        });
                    }
                );
            }
        );
    });
});