document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL query parameter or create new
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id') || Date.now().toString();

        console.log('Current document ID:', documentId);

        // If no ID exists, create a flag for a new document
        if (!urlParams.get('id')) {
            localStorage.setItem('isNewDocument', 'true');
        }

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

        // Get current document ID from URL or localStorage
        const documentId = localStorage.getItem('meetingDocumentId') || Date.now().toString();

        const meetingData = {
            title: document.getElementById('meetingName').value || 'Untitled Meeting',
            content: JSON.stringify({
                text: document.getElementById('meeting-content').value || '',
            }),
            template_type: 'Minutes of Meeting'
        };

        console.log('Saving document:', meetingData);

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
            // Try to parse error details
            const errorResponse = await response.json();
            throw new Error(errorResponse.details || 'Failed to save document');
        }

        const result = await response.json();
        console.log('Save result:', result);

        saveStatus.textContent = 'Saved successfully';

        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);

    } catch (error) {
        console.error('Save failed:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
        
        // Optional: Attempt to create a new document if PUT fails
        try {
            const createResponse = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: meetingData.title,
                    content: meetingData.content,
                    template_type: 'Minutes of Meeting'
                })
            });

            if (createResponse.ok) {
                const newDoc = await createResponse.json();
                console.log('Created new document:', newDoc);
                
                // Redirect to home page
                window.location.href = '/';
            }
        } catch (createError) {
            console.error('Failed to create new document:', createError);
        }
    } finally {
        saveButton.disabled = false;
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