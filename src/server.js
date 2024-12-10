const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exec } = require('child_process');

const fs = require('fs').promises;

const app = express();
const port = 8080;
const cors = require('cors');
app.use(cors({
    origin: '*', // Replace '*' with your frontend's URL in production
    credentials: true
}));

app.use(express.json());

// Serve static files
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname)));
app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

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

// app.post('/run-command', (req, res) => {
//     const { title, content } = req.body;

//     // Sanitize the title to create a safe file name
//     const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
//     const fileName = `${sanitizedTitle}.txt`;
//     const filePath = path.join('/home/aryan/user', fileName);

//     // Save content to a file
//     const saveCommand = `echo "${content}" > ${filePath}`;
//  // git remote add origin https://github.com/imaryandokania/documents.git
//     const gitCommands = `
//         cd ..
//         cd ..
//         cd user
//         git init
//         git config user.name "test"
//         git branch -M main
//         git add ${fileName} 
//         git commit -m "Add ${title}" 
//         git push origin main
//         rm -rf ${fileName} 
//     `;
//     // Execute the commands
//     exec(saveCommand, (saveError, saveStdout, saveStderr) => {
//         if (saveError) {
//             console.error(`Error saving file: ${saveStderr}`);
//             return res.status(500).send(saveStderr);
//         }

//         exec(gitCommands, (gitError, gitStdout, gitStderr) => {
//             if (gitError) {
//                 console.error(`Error with Git commands: ${gitStderr}`);
//                 return res.status(500).send(gitStderr);
//             }

//             res.send(gitStdout || 'File saved and changes pushed to repository successfully!');
//         });
//     });
// });



// app.get('/api/get-github-credentials', (req, res) => {
//     const { username } = req.query;

//     if (!username) {
//         console.error('Username is missing in the request');
//         return res.status(400).send('Username is required.');
//     }

//     console.log('Fetching credentials for username:', username);

//     const filePath = path.join(__dirname, 'github-credentials.json');

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading credentials file:', err);
//             return res.status(500).send('Failed to read credentials file.');
//         }

//         try {
//             const credentials = JSON.parse(data);

//             if (credentials.username !== username) {
//                 console.error('No credentials found for username:', username);
//                 return res.status(404).send('No credentials found for the specified username.');
//             }

//             res.json(credentials);
//         } catch (parseError) {
//             console.error('Error parsing credentials:', parseError);
//             res.status(500).send('Invalid credentials format.');
//         }
//     });
// });
app.get('/api/get-github-credentials', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).send('Username is required.');
    }

    const query = `SELECT username, ssh_key FROM github_credentials WHERE username = ?`;

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error retrieving GitHub credentials:', err);
            return res.status(500).send('Failed to retrieve GitHub credentials.');
        }

        if (!row) {
            return res.status(404).send('No credentials found for the specified username.');
        }

        res.json(row);
    });
});
app.post('/api/save-github-credentials', (req, res) => {
    const { username, sshKey } = req.body;

    if (!username || !sshKey) {
        return res.status(400).send('Both username and SSH key are required.');
    }

    const query = `
        INSERT INTO github_credentials (username, ssh_key)
        VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET ssh_key = excluded.ssh_key
    `;

    db.run(query, [username, sshKey], function (err) {
        if (err) {
            console.error('Error saving GitHub credentials:', err);
            return res.status(500).send('Failed to save GitHub credentials.');
        }

        res.send('GitHub credentials saved successfully.');
    });
});


app.post('/run-command', (req, res) => {
    const { documentId, title, content } = req.body;

    if (!documentId) {
        return res.status(400).send('Document ID is required.');
    }

    // Use documentId as the file name
    const fileName = `${documentId}.md`; // File name is now based on the document ID
    const filePath = path.join('/home/aryan/user', fileName); // Adjust path as necessary

    console.log(`Writing file: ${filePath}`);

    // Save content to a Markdown file
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Failed to save Markdown file.');
        }
    });

        console.log(`File created successfully at ${filePath}`);
        // Git commands
            // git push -u origin main 
        const gitCommands = `
            cd /home/aryan/user 
            git config user.name "test" 
            git add ${fileName} 
            git commit -m "Add ${title}" 
            git push -u https://imaryandokania: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@github.com/imaryandokania/documents.git main
         
        `;

        console.log(`Executing Git commands:\n${gitCommands}`);

        // Execute Git commands
        exec(gitCommands, (gitError, gitStdout, gitStderr) => {
            if (gitError) {
                console.error(`Error with Git commands: ${gitStderr}`);
                return res.status(500).send(gitStderr);
            }

            res.send(gitStdout || 'Markdown file committed and pushed to repository successfully!');
        });

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
        db.run(`
            CREATE TABLE IF NOT EXISTS github_credentials (
                username TEXT PRIMARY KEY,
                ssh_key TEXT NOT NULL
            )
        `);
        console.log('GitHub credentials table ensured.');
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


// Update document route with proper transaction handling
app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, template_type } = req.body;
    const now = new Date().toISOString();

    console.log('Received update request:', { id, title, content, template_type });

    // Begin transaction explicitly
    db.serialize(() => {
        db.run('BEGIN TRANSACTION', (beginErr) => {
            if (beginErr) {
                console.error('Error beginning transaction:', beginErr);
                return res.status(500).json({ error: beginErr.message });
            }

            // Update documents table
            db.run(
                'UPDATE documents SET title = ?, content = ?, updated_at = ? WHERE id = ?',
                [title, content, now, id],
                function(updateErr) {
                    if (updateErr) {
                        console.error('Error updating document:', updateErr);
                        db.run('ROLLBACK', () => {
                            res.status(500).json({ error: updateErr.message });
                        });
                        return;
                    }

                    if (this.changes === 0) {
                        db.run('ROLLBACK', () => {
                            res.status(404).json({ error: 'Document not found' });
                        });
                        return;
                    }

                    // Insert into history
                    db.run(
                        'INSERT INTO history (document_id, created_at, updated_at) VALUES (?, ?, ?)',
                        [id, now, now],
                        function(historyErr) {
                            if (historyErr) {
                                console.error('Error updating history:', historyErr);
                                db.run('ROLLBACK', () => {
                                    res.status(500).json({ error: historyErr.message });
                                });
                                return;
                            }

                            // Commit the transaction
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    console.error('Error committing transaction:', commitErr);
                                    db.run('ROLLBACK', () => {
                                        res.status(500).json({ error: commitErr.message });
                                    });
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
});


// **New DELETE Route Added Below**
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
// **End of DELETE Route**




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
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
