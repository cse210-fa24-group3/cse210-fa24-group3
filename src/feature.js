/**
 * Event listener for the DOMContentLoaded event. This function handles loading or creating a new feature document
 * based on the URL parameters. It also loads the feature content and populates the UI.
 */
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get the document ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');

        console.log('Current document ID:', documentId);

        if (documentId) {
            // Check if the feature exists
            const response = await fetch(`/api/documents/${documentId}`);
            if (response.ok) {
                // Feature exists, load its content
                const loadDocument = await response.json();
                console.log('Loaded document:', loadDocument);

                // Populate the fields with the existing data
                document.getElementById('meetingName').value = loadDocument.title || 'Untitled Feature';
                document.getElementById('markdown-editor').value = loadDocument.content || '';
                updatePreview();
            } else if (response.status === 404) {
                // Feature does not exist, create a new document
                console.log('Feature not found, creating a new document...');
                await createNewFeature();
            } else {
                throw new Error(`Unexpected response: ${response.status}`);
            }
        } else {
            // No document ID provided, create a new document
            console.log('No document ID found in URL, creating a new document...');
            await createNewFeature();
        }
        
        // Add event listeners for buttons
        document.getElementById('deleteButton').addEventListener('click', deleteDocument);
        document.getElementById('commitid').addEventListener('click', commitDocument);
        document.getElementById('saveButton').addEventListener('click', saveDocument);
        document.getElementById('downloadButton').addEventListener('click', downloadFeaturePDF);

    } catch (error) {
        console.error('Error during document loading/creation:', error);
    }
});

/**
 * Creates a new feature document and saves it to the server.
 */
async function createNewFeature() {
    const newDocData = {
        title: 'Untitled Feature',
        content: `# Feature Specification
**Description:** [Provide feature description]

**Details:** [Feature details]

## Objectives
- [Objective 1]
- [Objective 2]

## Requirements
### Functional Requirements
- [Requirement 1]
- [Requirement 2]

### Non-Functional Requirements
- [Performance requirement]
- [Security requirement]

## Design Considerations
- [Design constraint 1]
- [Design constraint 2]

## Implementation Notes
- [Technical implementation detail]

## Testing Strategy
- [Testing approach]
- [Test cases]

## Acceptance Criteria
- [Criterion 1]
- [Criterion 2]`,
        template_type: 'Feature Specification'
    };

    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDocData)
    });

    if (response.ok) {
        const result = await response.json();
        console.log('New feature created:', result);

        // Update the UI with the new document's data
        document.getElementById('meetingName').value = newDocData.title;
        document.getElementById('markdown-editor').value = newDocData.content;

        // Store the new document ID and update the URL
        localStorage.setItem('meetingDocumentId', result.documentId);
        history.replaceState(null, '', `feature.html?id=${result.documentId}`);
    } else {
        throw new Error('Failed to create a new document');
    }
}

/**
 * Commits the current document to the backend and updates the UI accordingly.
 */
async function commitDocument() {
    const saveButton = document.getElementById('commitid');
    const saveStatus = document.getElementById('saveStatus');

    const documentId = localStorage.getItem('meetingDocumentId') || Date.now().toString();

    // Get the current title from the input field
    const currentTitle = document.getElementById('meetingName').value.trim() || 'Untitled Feature';

    const featureData = {
        documentId,
        title: currentTitle,
        content: document.getElementById('markdown-editor').value || '', 
        template_type: 'Feature Specification'
    };

    saveButton.disabled = true;
    saveStatus.textContent = 'Running CLI command...';

    try {
        const response = await fetch('/run-command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(featureData),
        });

        if (response.ok) {
            const result = await response.text();
            saveStatus.textContent = `Pushed to GitHub`;
        } else {
            const error = await response.text();
            saveStatus.textContent = `Error: ${error}`;
        }
    } catch (error) {
        saveStatus.textContent = `Error: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
}

/**
 * Saves the currently edited document.
 */
async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');

    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('id') || localStorage.getItem('meetingDocumentId');

    // Get the current title from the input field, ensure it's not empty
    const currentTitle = document.getElementById('meetingName').value.trim() || 'Untitled Feature';

    const featureData = {
        title: currentTitle,
        content: document.getElementById('markdown-editor').value || '', 
        template_type: 'Feature Specification'
    };

    saveButton.disabled = true;
    saveStatus.textContent = 'Saving...';
    saveStatus.style.color = 'black';

    try {
        let response;
        if (!documentId) {
            // Create new document
            response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(featureData)
            });
        } else {
            // Update existing document
            response = await fetch(`/api/documents/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...featureData,
                    documentId // Include documentId for backend tracking
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to save document');
        }

        const result = await response.json();

        // Update localStorage and URL if it's a new document
        if (!documentId) {
            localStorage.setItem('meetingDocumentId', result.documentId);
            history.replaceState(null, '', `feature.html?id=${result.documentId}`);
        }

        // Show success message
        saveStatus.textContent = 'Saved Successfully';
        saveStatus.style.color = 'green';

        // Optional: Automatically clear the success message after 3 seconds
        setTimeout(() => {
            saveStatus.textContent = '';
        }, 3000);

    } catch (error) {
        console.error('Save failed:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
        saveStatus.style.color = 'red';
    } finally {
        saveButton.disabled = false;
    }
}

/**
 * Deletes the current document.
 */
async function deleteDocument() {
    const deleteButton = document.getElementById('deleteButton');
    const deleteStatus = document.getElementById('saveStatus');

    const confirmDelete = confirm('Are you sure you want to delete this feature specification? This action cannot be undone.');
    if (!confirmDelete) {
        return;
    }

    try {
        deleteButton.disabled = true;
        deleteStatus.textContent = 'Deleting...';

        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id') || localStorage.getItem('meetingDocumentId');
        
        if (!documentId) {
            throw new Error('No document ID found');
        }

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to delete document');
        }

        deleteStatus.textContent = 'Deleted successfully. Redirecting...';

        localStorage.removeItem('meetingDocumentId');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);

    } catch (error) {
        console.error('Delete failed:', error);
        deleteStatus.textContent = `Failed to delete: ${error.message}`;
    } finally {
        deleteButton.disabled = false;
    }
}

/**
 * Downloads the feature document as a PDF.
 */
function downloadFeaturePDF() {
    const content = document.getElementById('markdown-editor').value;
    const filename = `${document.getElementById('meetingName').value || 'feature'}.pdf`;
    
    // Create a blob with the content
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}