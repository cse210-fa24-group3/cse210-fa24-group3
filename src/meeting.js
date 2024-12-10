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