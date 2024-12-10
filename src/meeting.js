document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');

        console.log('Current document ID:', documentId);

        if (documentId) {
            // Load existing document
            const response = await fetch(`/api/documents/${documentId}`);
            console.log('Load response:', response);

            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            const loadDocument = await response.json();
            console.log('Loaded document:', loadDocument);

            const content = JSON.parse(loadDocument.content);
            
            // Set the document
            document.getElementById('meetingName').value = loadDocument.title;
            if (content.text) {
                document.getElementById('meeting-content').value = content.text;
            }

            // Store the ID for future saves
            localStorage.setItem('meetingDocumentId', documentId);
        } else {
            // Create new document
            const newDocData = {
                title: 'Untitled Meeting',
                content: JSON.stringify({
                    text: document.getElementById('meeting-content').value || ''
                }),
                template_type: 'Minutes of Meeting'
            };

            const createResponse = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newDocData)
            });

            if (createResponse.ok) {
                const result = await createResponse.json();
                localStorage.setItem('meetingDocumentId', result.documentId);
                // Update URL with new document ID
                history.replaceState(null, '', `meeting.html?id=${result.documentId}`);
            }
        }
        
        // Add event listener for the delete button
        const deleteButton = document.getElementById('deleteButton');
        deleteButton.addEventListener('click', deleteDocument);

    } catch (error) {
        console.error('Error loading/creating document:', error);
    }
});

async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');
    const meetingData = {
        title: document.getElementById('meetingName').value || 'Untitled Meeting',
        content: JSON.stringify({
            text: document.getElementById('meeting-content').value || '',
        }),
        template_type: 'Minutes of Meeting'
    };

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        const documentId = localStorage.getItem('meetingDocumentId');
        if (!documentId) {
            throw new Error('No document ID found');
        }

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
            throw new Error('Failed to save document');
        }

        const result = await response.json();
        console.log('Save result:', result);
        saveStatus.textContent = 'Saved successfully';

        // Redirect after successful save
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);

    } catch (error) {
        console.error('Save failed:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
        
        // Try to create new document if update fails
        try {
            const createResponse = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(meetingData)
            });

            if (createResponse.ok) {
                const newDoc = await createResponse.json();
                localStorage.setItem('meetingDocumentId', newDoc.documentId);
                window.location.href = '/';
            }
        } catch (createError) {
            console.error('Failed to create new document:', createError);
        }
    } finally {
        saveButton.disabled = false;
    }
}


// ============= DELETE FUNCTION =============
async function deleteDocument() {
    const deleteButton = document.getElementById('deleteButton');
    const deleteStatus = document.getElementById('saveStatus');

    // Confirmation Dialog
    const confirmDelete = confirm('Are you sure you want to delete this feature specification? This action cannot be undone.');
    if (!confirmDelete) {
        return; // User canceled the deletion
    }

    try {
        deleteButton.disabled = true;
        deleteStatus.textContent = 'Deleting...';

        // Get current document ID from URL
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        if (!documentId || documentId === 'feature') {
            throw new Error('Invalid document ID');
        }

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete document');
        }

        const result = await response.json();
        console.log('Delete result:', result);

        deleteStatus.textContent = 'Deleted successfully. Redirecting...';

        // Redirect to Home or another appropriate page after deletion
        setTimeout(() => {
            window.location.href = '/'; // Change this URL if you want to redirect elsewhere
        }, 2000);

    } catch (error) {
        console.error('Delete failed:', error);
        deleteStatus.textContent = `Failed to delete: ${error.message}`;
    } finally {
        deleteButton.disabled = false;
    }
}



// ============= LOADING FUNCTIONS =============
async function loadDocument(documentId) {
    try {
        const baseUrl = 'http://104.155.190.17:8080';
        const response = await fetch(`${baseUrl}/api/documents/${documentId}`);

        if (!response.ok) {
            throw new Error('Document not found');
        }

        const loadDocument = await response.json();
        const content = JSON.parse(loadDocument.content);
        console.log(content);

        // Update document
        document.getElementById('meetingName').textContent = loadDocument.title;
        if (content.text != ''){
            document.getElementById('meeting-content').textContent = content.text;
        }

        // Store the ID
        localStorage.setItem('meetingDocumentId', documentId);

    } catch (error) {
        console.error('Failed to load document:', error);
        // If document not found, redirect to home
        if (error.message === 'Document not found') {
            window.location.href = '/';
        }
    }
}

// ============= UTILITY FUNCTIONS =============
// Update the current date
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Auto-save functionality
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocument, 30000);
}