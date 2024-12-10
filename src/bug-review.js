// Update date on page load
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Auto-save functionality
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocument, 30000);
}

// Load existing document or prepare for new document
document.addEventListener('DOMContentLoaded', async function () {
    updateDate();

    // Ensure all necessary elements exist before adding event listeners
    const titleInput = document.getElementById('titleInput');
    const contentArea = document.getElementById('contentArea');
    const saveButton = document.getElementById('saveButton');

    // Check if there's an existing document ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('id');

    // Add input listeners for auto-save
    if (titleInput) {
        titleInput.addEventListener('input', scheduleAutoSave);
    }
    if (contentArea) {
        contentArea.addEventListener('input', scheduleAutoSave);
    }

    if (documentId) {
        try {
            // Load existing document
            const response = await fetch(`/api/documents/${documentId}`);
            
            if (response.ok) {
                const loadDocument = await response.json();
                
                // Parse the content (handle potential string or object)
                const content = typeof loadDocument.content === 'string' 
                    ? JSON.parse(loadDocument.content) 
                    : loadDocument.content;
                
                // Populate form fields if elements exist
                if (titleInput) titleInput.value = loadDocument.title || '';
                if (contentArea) contentArea.value = content.text || content || '';
                
                // Store current document ID for saving
                localStorage.setItem('currentDocumentId', documentId);
            }
        } catch (error) {
            console.error('Error loading document:', error);
        }
    } else {
        // Create a new document
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'New Bug Report',
                    content: JSON.stringify({ text: '' }),
                    template_type: 'Bug Report'
                })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('currentDocumentId', result.documentId);
                // Update URL with new document ID
                history.replaceState(null, '', `bug-review.html?id=${result.documentId}`);
            }
        } catch (error) {
            console.error('Error creating new document:', error);
        }
    }

    // Add save button click event listener
    if (saveButton) {
        saveButton.addEventListener('click', saveDocument);
    }
});

async function saveDocument() {
    console.log('Save document called');
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');
    const titleInput = document.getElementById('titleInput');
    const contentArea = document.getElementById('contentArea');

    // Ensure all required elements exist
    if (!saveButton || !saveStatus || !titleInput || !contentArea) {
        console.error('Required DOM elements are missing');
        return;
    }

    const documentId = localStorage.getItem('currentDocumentId');

    console.log('Current document ID:', documentId);

    if (!documentId) {
        console.error('No document ID found');
        saveStatus.textContent = 'Error: No document ID';
        return;
    }

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        const bugData = {
            title: titleInput.value,
            content: JSON.stringify({
                text: contentArea.value,
            }),
            template_type: 'Bug Report'
        };

        console.log('Saving document data:', bugData);

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bugData)
        });

        console.log('Save response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Save failed:', errorText);
            throw new Error(`Failed to save document: ${errorText}`);
        }

        // Trigger document-saved event for other parts of the app
        const event = new CustomEvent('document-saved');
        window.dispatchEvent(event);

        // Clear local storage and redirect to index.html
        localStorage.removeItem('currentDocumentId');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Detailed save error:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
}

// Delete Document with this ID.
async function deleteDocument() {
    const deleteButton = document.getElementById('deleteButton');
    const deleteStatus = document.getElementById('saveStatus');

    // Confirmation Dialog
    const confirmDelete = confirm('Are you sure you want to delete this bug review? This action cannot be undone.');
    if (!confirmDelete) {
        return; // User canceled the deletion
    }

    try {
        deleteButton.disabled = true;
        deleteStatus.textContent = 'Deleting...';

        // Get current document ID from URL
        // const pathParts = window.location.pathname.split('id=');
        // const documentId = pathParts[pathParts.length - 1];
        // console.log(documentId);
        const documentId = localStorage.getItem('currentDocumentId');

        console.log('Current document ID:', documentId);

        if (!documentId || documentId === 'bug-review') {
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

// Additional error handling for page load issues
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
    alert('An unexpected error occurred. Please check the console for details.');
});