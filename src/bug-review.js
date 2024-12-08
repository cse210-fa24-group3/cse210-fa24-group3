
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL path
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        console.log('Current document ID:', documentId);

        if (documentId && documentId !== 'bug-review') {
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
            document.getElementById('titleInput').value = loadDocument.title;
            if (content.text != ''){
                document.getElementById('contentArea').value = content.text;
            }
    

            // Store the ID for future saves
            localStorage.setItem('currentId', documentId);
        }
    } catch (error) {
        console.error('Error loading document:', error);
    }
});

// ============= SAVE FUNCTION =============
// Update your saveDocument function to properly save tasks
async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        // Get current document ID from URL
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        if (!documentId || documentId === 'bug-review') {
            throw new Error('Invalid document ID');
        }

        const bugData = {
            id: documentId,
            title: document.getElementById('titleInput').value,
            content: JSON.stringify({
                text: document.getElementById('contentArea').value,
            }),
            template_type: 'bug-review'
        };

        console.log(bugData);

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bugData)
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

// ============= LOADING FUNCTIONS =============
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
        document.getElementById('titleInput').textContent = loadDocument.title;
        if (content.text != ''){
            document.getElementById('contentArea').textContent = content.text;
        }

        // Store the ID
        localStorage.setItem('currentId', documentId);

    } catch (error) {
        console.error('Failed to load document:', error);
        // If document not found, redirect to home
        if (error.message === 'Document not found') {
            window.location.href = '/';
        }
    }
}

// ============= UTILITY FUNCTIONS =============
// Update the date
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