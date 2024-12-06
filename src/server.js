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

// Utility function for database transactions
function runTransaction(queries) {
    return new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                return reject(err);
            }

            const runQuery = (query, params = []) => {
                return new Promise((queryResolve, queryReject) => {
                    db.run(query, params, function(err) {
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
    
    if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
    }
    
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error', details: err.message });
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
app.post('/api/documents', async (req, res) => {
    console.log('Received POST request for document:', req.body);
    const { title, content, template_type = 'New Document' } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const id = Date.now().toString(); // Generate unique ID
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
        console.error('Document creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Update document
app.put('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const now = new Date().toISOString();

    try {
        await runTransaction([
            {
                query: 'UPDATE documents SET title = ?, content = ?, updated_at = ? WHERE id = ?',
                params: [title, content, now, id]
            },
            {
                query: 'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                params: [id, now, now]
            }
        ]);

        res.json({ 
            success: true, 
            message: 'Document updated successfully' 
        });
    } catch (error) {
        console.error('Document update error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Special route creation function to reduce code duplication
function createSpecialDocumentRoute(templateType) {
    return async (req, res) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        
        console.log(`Creating new ${templateType} document...`);

        const emptyDocument = {
            title: "",
            content: JSON.stringify({
                text: '',
                lastUpdated: now
            }),
            template_type: templateType
        };

        try {
            await runTransaction([
                {
                    query: 'INSERT INTO documents (id, title, content, template_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                    params: [id, emptyDocument.title, emptyDocument.content, emptyDocument.template_type, now, now]
                },
                {
                    query: 'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                    params: [id, now, now]
                }
            ]);

            console.log(`${templateType} created successfully with ID:`, id);
            return res.status(200).json({ 
                success: true, 
                documentId: id,
                message: `${templateType} created successfully`
            });
        } catch (error) {
            console.error(`${templateType} creation error:`, error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    };
}


// Create routes for different document types
app.post('/api/documents/new-todo', createSpecialDocumentRoute('todo'));
app.post('/api/documents/new-bug-review', createSpecialDocumentRoute('bug-review'));
app.post('/api/documents/new-feature', createSpecialDocumentRoute('feature'));
app.post('/api/documents/new-meeting', createSpecialDocumentRoute('meeting'));

// Route handlers for serving HTML pages
const htmlRoutes = [
    '/todo_template/todo.html',
    '/',
    '/editor',
    '/journal',
    '/journal/:id',
    '/bug-review',
    '/bug-review/:id',
    '/feature',
    '/feature/:id',
    '/meeting',
    '/meeting/:id'
];

htmlRoutes.forEach(route => {
    app.get(route, (req, res) => {
        let filePath;
        switch(route) {
            case '/todo_template/todo.html':
                filePath = path.join(__dirname, 'todo_template', 'todo.html');
                break;
            case '/':
                filePath = path.join(__dirname, 'index.html');
                break;
            case '/editor':
                filePath = path.join(__dirname, 'new-page', 'editor.html');
                break;
            case '/journal':
            case '/journal/:id':
                filePath = path.join(__dirname, 'journal.html');
                break;
            case '/bug-review':
            case '/bug-review/:id':
                filePath = path.join(__dirname, 'bug-review.html');
                break;
            case '/feature':
            case '/feature/:id':
                filePath = path.join(__dirname, 'feature.html');
                break;
            case '/meeting':
            case '/meeting/:id':
                filePath = path.join(__dirname, 'meeting.html');
                break;
        }
        
        // Use fs to check if file exists before sending
        fs.access(filePath, fs.constants.F_OK)
            .then(() => res.sendFile(filePath))
            .catch(err => {
                console.error(`File not found: ${filePath}`, err);
                res.status(404).send('File not found');
            });
    });
});

// Database print route
app.get('/api/print-db', (req, res) => {
    const result = {
        documents: [],
        history: []
    };

    // Function to run queries and collect results
    const runQuery = (query, table) => {
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    result[table] = rows;
                    resolve();
                }
            });
        });
    };

    // Run queries for both tables
    Promise.all([
        runQuery('SELECT * FROM documents ORDER BY created_at DESC', 'documents'),
        runQuery('SELECT * FROM history ORDER BY created_at DESC', 'history')
    ])
    .then(() => {
        // Send the results as JSON response
        res.json({
            success: true,
            database_contents: result,
            total_documents: result.documents.length,
            total_history_entries: result.history.length
        });
    })
    .catch((err) => {
        console.error('Error printing database:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve database contents',
            details: err.message 
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});