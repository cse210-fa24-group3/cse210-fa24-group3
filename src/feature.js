document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');

        console.log('Current document ID:', documentId);

        if (documentId) {
            // Load document by ID
            const response = await fetch(`/api/documents/${documentId}`);
            console.log('Load response:', response);

            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            const loadDocument = await response.json();
            console.log('Loaded document:', loadDocument);

            const content = loadDocument.content ? JSON.parse(loadDocument.content) : {};

            // Set the document
            document.getElementById('featureName').value = loadDocument.title || '';
            document.getElementById('feature-content').value = content.text || '';

            // Store the ID for future saves
            localStorage.setItem('featureDocumentId', documentId);
        }

        // Add event listener to save button
        document.getElementById('saveButton').addEventListener('click', saveFeatureDocument);
    } catch (error) {
        console.error('Error loading document:', error);
    }
});

// ============= SAVE FUNCTION =============
async function saveFeatureDocument() {
    // Get DOM elements with null checks
    const saveButton = document.getElementById('saveButton');
    const featureNameInput = document.getElementById('featureName');
    const featureContentInput = document.getElementById('feature-content');
    const saveStatus = document.getElementById('saveStatus');

    // Defensive checks for required elements
    if (!saveButton || !featureNameInput || !featureContentInput || !saveStatus) {
        console.error('Missing DOM elements:', {
            saveButton: !!saveButton,
            featureNameInput: !!featureNameInput,
            featureContentInput: !!featureContentInput,
            saveStatus: !!saveStatus
        });
        alert('Error: Some page elements are missing. Please reload the page.');
        return;
    }

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        // Get current document ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');

        // Determine whether to use existing ID or create new one
        const finalDocumentId = documentId || Date.now().toString();

        const featureData = {
            id: finalDocumentId,
            title: featureNameInput.value || 'Untitled Feature',
            content: JSON.stringify({
                text: featureContentInput.value || '',
            }),
            template_type: 'Feature Specification'
        };

        console.log('Preparing to save document:', featureData);

        const method = documentId ? 'PUT' : 'POST';
        const url = method === 'PUT' 
            ? `/api/documents/${finalDocumentId}` 
            : '/api/documents';

        console.log('Save request details:', {
            method,
            url,
            body: featureData
        });

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(featureData)
        });

        // Log full response details
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            result = responseText;
        }

        console.log('Save result:', result);

        saveStatus.textContent = 'Saved successfully';

        // Store the document ID for future reference
        localStorage.setItem('featureDocumentId', finalDocumentId);

        // Dispatch custom event to trigger recently edited refresh
        const event = new CustomEvent('document-saved');
        window.dispatchEvent(event);

        // Redirect to index.html after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 500);

    } catch (error) {
        console.error('Detailed save error:', error);
        console.error('Error stack:', error.stack);
        saveStatus.textContent = `Failed to save: ${error.message}`;
    } finally {
        if (saveButton) saveButton.disabled = false;
    }
}

// Utility function to update the current date
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

// Call updateDate when the page loads
document.addEventListener('DOMContentLoaded', updateDate);