let documentId = new URLSearchParams(window.location.search).get('id') || 
                 window.location.pathname.split('/').pop();
let lastSavedContent = '';
let isNewDocument = !documentId;

// Initialize autosave timer
let autosaveTimer = null;

async function saveDocument(event) {
    if (event) event.preventDefault();
    console.log('Starting save process...');

    const titleInput = document.getElementById('titleInput');
    const contentArea = document.getElementById('contentArea');
    const saveStatus = document.getElementById('saveStatus');

    console.log({
        title: titleInput?.value,
        content: contentArea?.value,
        saveStatusExists: !!saveStatus
    });

    if (!titleInput || !contentArea || !saveStatus) {
        console.error('Required elements missing!');
        return;
    }

    const url = isNewDocument ? '/api/documents' : `/api/documents/${documentId}`;
    console.log(`Saving to URL: ${url}, Method: ${isNewDocument ? 'POST' : 'PUT'}`);
    
    try {
        const response = await fetch(url, {
            method: isNewDocument ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titleInput.value,
                content: contentArea.value
            })
        });

        console.log('Response:', response);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            saveStatus.textContent = 'Saved!';
        } else {
            throw new Error(data.error || 'Unknown save error');
        }
    } catch (error) {
        console.error('Save failed:', error.message);
        saveStatus.textContent = 'Error saving';
    }
}


// Rest of the script remains the same as previous version...

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded');

    const titleInput = document.getElementById('titleInput');
    const contentArea = document.getElementById('contentArea');
    const saveButton = document.getElementById('saveButton');

    if (!titleInput || !contentArea || !saveButton) {
        console.error('Required elements not found');
        return;
    }

    // Load existing document if applicable
    loadDocument();

    // Attach save button click event
    saveButton.addEventListener('click', (event) => {
        console.log('Save Button Clicked');
        saveDocument(event);
    });

    // Setup autosave
    setupAutosave();
});
