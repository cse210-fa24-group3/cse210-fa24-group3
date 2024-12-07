document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL path
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        console.log('Current document ID:', documentId);

        if (documentId && documentId !== 'feature') {
            // Load document by ID
            const response = await fetch(`${FLASK_BASE_URL}/api/documents/${documentId}`);
            console.log('Load response:', response);

            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            const loadDocument = await response.json();
            console.log('Loaded document:', loadDocument);

            const content = JSON.parse(loadDocument.content);
            console.log(content);

            // Set the document
            document.getElementById('featureName').value = loadDocument.title;
            if (content.text != ''){
                document.getElementById('feature-content').value = content.text;
            }

            // Store the ID for future saves
            localStorage.setItem('featureDocumentId', documentId);
        }
    } catch (error) {
        console.error('Error loading document:', error);
    }
});

// ============= SAVE FUNCTION =============
async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        // Get current document ID from URL
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        if (!documentId || documentId === 'feature') {
            throw new Error('Invalid document ID');
        }

        const featureData = {
            id: documentId,
            title: document.getElementById('featureName').value,
            content: JSON.stringify({
                text: document.getElementById('feature-content').value,
            }),
            template_type: 'feature'
        };

        console.log(featureData);

        const response = await fetch(`${FLASK_BASE_URL}/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(featureData)
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
        const baseUrl = ' http://104.155.190.17:8080';
        const response = await fetch(`${baseUrl}${FLASK_BASE_URL}/api/documents/${documentId}`);

        if (!response.ok) {
            throw new Error('Document not found');
        }

        const loadDocument = await response.json();
        const content = JSON.parse(loadDocument.content);
        console.log(content);

        // Update document
        document.getElementById('featureName').textContent = loadDocument.title;
        if (content.text != ''){
            document.getElementById('feature-content').textContent = content.text;
        }

        // Store the ID
        localStorage.setItem('featureDocumentId', documentId);

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