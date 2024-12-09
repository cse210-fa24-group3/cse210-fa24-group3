/**
 * Initializes the application when the DOM content is fully loaded.
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL path
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        console.log('Current document ID:', documentId);

        if (documentId && documentId !== 'meeting') {
            // Load document by ID
            const response = await fetch(`/api/documents/${documentId}`);
            console.log('Load response:', response);

            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            const loadDocument = await response.json();
            console.log('Loaded document:', loadDocument);

            const content = JSON.parse(loadDocument.content);
            console.log(content);

            // Set the document
            document.getElementById('meetingName').value = loadDocument.title;
            if (content.text != ''){
                document.getElementById('meeting-content').value = content.text;
            }

            // Store the ID for future saves
            localStorage.setItem('meetingDocumentId', documentId);
        }
        
        // Add event listener for the delete button
        const deleteButton = document.getElementById('deleteButton');
        deleteButton.addEventListener('click', deleteDocument);

    } catch (error) {
        console.error('Error loading document:', error);
    }
});

// ============= SAVE FUNCTION =============
/**
 * Saves the current document to the server.
 * @async
 * @function saveDocument
 */
async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        // Get current document ID from URL
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        if (!documentId || documentId === 'meeting') {
            throw new Error('Invalid document ID');
        }

        const meetingData = {
            id: documentId,
            title: document.getElementById('meetingName').value,
            content: JSON.stringify({
                text: document.getElementById('meeting-content').value,
            }),
            template_type: 'meeting'
        };

        console.log(meetingData);

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

        setTimeout(() => {
            saveStatus.textContent = '';
        }, 3000);

    } catch (error) {
        console.error('Save failed:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
}


// ============= DELETE FUNCTION =============
/**
 * Deletes the current document from the server.
 * @async
 * @function deleteDocument
 */
async function deleteDocument() {
    const deleteButton = document.getElementById('deleteButton');
    const deleteStatus = document.getElementById('deleteStatus');

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
/**
 * Loads a document by its unique identifier.
 * @async
 * @function loadDocument
 * @param {string} documentId - The ID of the document to load.
 */
async function loadDocument(documentId) {
    try {
        const baseUrl = 'http://localhost:3000';
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
/**
 * Updates the displayed current date on the webpage.
 * @function updateDate
 */
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


/**
 * Schedules an automatic save operation after a specified timeout.
 * @function scheduleAutoSave
 */
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocument, 30000);
}