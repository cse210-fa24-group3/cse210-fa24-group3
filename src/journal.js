let documentId = new URLSearchParams(window.location.search).get('id') || 
                 window.location.pathname.split('/').pop();
let lastSavedContent = '';
let isNewDocument = !documentId;

// Initialize autosave timer
let autosaveTimer = null;

/**
 * Saves the currently edited document.
 *
 * Gets the current title and content from the UI, sends the updated data to the server,
 * and updates the UI to reflect the save status.
 * @async
 * @function saveDocument
 */
async function saveDocument() {
    const titleInput = document.getElementById('titleInput');
    const contentArea = document.getElementById('contentArea');
    const saveStatus = document.getElementById('saveStatus');
    
    const documentData = {
        title: titleInput.value || 'Untitled Journal Entry',
        content: contentArea.value,
        template_type: 'journal'
    };

    try {
        saveStatus.textContent = 'Saving...';
        
        const method = isNewDocument ? 'POST' : 'PUT';
        const url = isNewDocument ? '/api/documents' : `/api/documents/${documentId}`;
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(documentData)
        });

        const data = await response.json();
        
        if (data.success) {
            if (isNewDocument && data.documentId) {
                documentId = data.documentId;
                isNewDocument = false;
                // Update URL without reloading the page
                window.history.pushState({}, '', `/journal/${documentId}`);
            }
            lastSavedContent = contentArea.value;
            saveStatus.textContent = 'Saved';
            setTimeout(() => {
                saveStatus.textContent = '';
            }, 2000);
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        console.error('Error saving document:', error);
        saveStatus.textContent = 'Error saving';
    }
}

/**
 * Loads a document by its ID.
 * @param {string} documentId - The ID of the document to load.
 * @throws {Error} If the document is not found.
 */
async function loadDocument() {
    if (!documentId) return;

    try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) throw new Error('Failed to load document');
        
        const document = await response.json();
        
        document.getElementById('titleInput').value = document.title;
        document.getElementById('contentArea').value = document.content;
        lastSavedContent = document.content;
    } catch (error) {
        console.error('Error loading document:', error);
    }
}

/**
 * Schedules the auto-save timer to save the document after a specified delay.
 * Clears any existing timer before setting a new one.
 * @function setupAutosave
 */
function setupAutosave() {
    const contentArea = document.getElementById('contentArea');
    const titleInput = document.getElementById('titleInput');

    function triggerAutosave() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
            if (contentArea.value !== lastSavedContent) {
                saveDocument();
            }
        }, 3000); // Autosave after 3 seconds of inactivity
    }

    contentArea.addEventListener('input', triggerAutosave);
    titleInput.addEventListener('input', triggerAutosave);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDocument();
    setupAutosave();
    
    // Manual save button
    document.getElementById('saveButton').addEventListener('click', saveDocument);
});