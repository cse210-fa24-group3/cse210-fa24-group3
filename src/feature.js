document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get document ID from URL path
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        console.log('Current document ID:', documentId);

        if (documentId && documentId !== 'feature') {
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
            document.getElementById('featureName').textContent = loadDocument.title;
            document.getElementById('author-input').value = content.author || '';
            document.getElementById('status-select').value = content.status || 'draft';
            document.querySelector('.target').value = content.targetRelease || '';
            document.querySelector('.editable-area').innerHTML = content.description || '';

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
            title: document.getElementById('featureName').textContent,
            content: JSON.stringify({
                author: document.getElementById('author-input').value,
                status: document.getElementById('status-select').value,
                targetRelease: document.querySelector('.target').value,
                description: document.querySelector('.editable-area').innerHTML,
            }),
            template_type: 'feature'
        };

        console.log(featureData);

        const response = await fetch(`/api/documents/${documentId}`, {
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
        const baseUrl = 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/documents/${documentId}`);

        if (!response.ok) {
            throw new Error('Document not found');
        }

        const loadDocument = await response.json();
        const content = JSON.parse(loadDocument.content);
        console.log(content);

        // Update document
        document.getElementById('featureName').textContent = loadDocument.title;
        if (content.author) {
            document.getElementById('author-input').value = content.author;
        }
        if (content.status) {
            document.getElementById('status-select').value = content.status;
        }
        if (content.targetRelease) {
            document.querySelector('.input-field:nth-of-type(3)').value = content.targetRelease;
        }
        if (content.description) {
            document.querySelector('.editable-container').innerHTML = content.description;
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

// Edit feature name
// function editFeatureName() {
//     const featureNameElement = document.getElementById('featureName');
//     const currentName = featureNameElement.textContent;
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.className = 'feature-name-input';
//     input.value = currentName === 'Click to add feature name' ? '' : currentName;

//     input.onblur = function () {
//         saveFeatureName(this.value);
//     };

//     input.onkeypress = function (e) {
//         if (e.key === 'Enter') {
//             saveFeatureName(this.value);
//         }
//     };

//     featureNameElement.parentNode.replaceChild(input, featureNameElement);
//     input.focus();
// }

// // Save feature name
// function saveFeatureName(name) {
//     const h2 = document.createElement('h2');
//     h2.id = 'featureName';
//     h2.className = 'feature-name';
//     h2.textContent = name.trim() || 'Click to add feature name';
//     h2.onclick = editFeatureName;

//     const input = document.querySelector('.feature-name-input');
//     input.parentNode.replaceChild(h2, input);

//     localStorage.setItem('featureTitle', h2.textContent);
// }


// Auto-save functionality
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocument, 30000);
}