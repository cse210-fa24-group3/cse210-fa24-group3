// document.addEventListener('DOMContentLoaded', async function () {
//     try {
//         // Get document ID from URL parameters
//         const urlParams = new URLSearchParams(window.location.search);
//         const documentId = urlParams.get('id');

//         console.log('Current document ID:', documentId);

//         if (documentId) {
//             // Load existing document
//             const response = await fetch(`/api/documents/${documentId}`);
//             console.log('Load response:', response);

//             if (!response.ok) {
//                 throw new Error('Failed to load document');
//             }

//             const loadDocument = await response.json();
//             console.log('Loaded document:', loadDocument);

//             const content = JSON.parse(loadDocument.content);
            
//             // Set the document
//             document.getElementById('meetingName').value = loadDocument.title;
//             if (content.text) {
//                 document.getElementById('meeting-content').value = content.text;
//             }

//             // Store the ID for future saves
//             localStorage.setItem('meetingDocumentId', documentId);
//         } else {
//             // Create new document
//             const newDocData = {
//                 title: 'Untitled Meeting',
//                 content: JSON.stringify({
//                     text: document.getElementById('meeting-content').value || ''
//                 }),
//                 template_type: 'Minutes of Meeting'
//             };

//             const createResponse = await fetch('/api/documents', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(newDocData)
//             });

//             if (createResponse.ok) {
//                 const result = await createResponse.json();
//                 localStorage.setItem('meetingDocumentId', result.documentId);
//                 // Update URL with new document ID
//                 history.replaceState(null, '', `meeting.html?id=${result.documentId}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error loading/creating document:', error);
//     }
// });
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get the document ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');

        console.log('Current document ID:', documentId);

        if (documentId) {
            // Check if the meeting exists
            const response = await fetch(`/api/documents/${documentId}`);
            if (response.ok) {
                // Meeting exists, load its content
                const loadDocument = await response.json();
                console.log('Loaded document:', loadDocument);

                // Populate the fields with the existing data
                document.getElementById('meetingName').value = loadDocument.title;
                document.getElementById('markdown-editor').value = loadDocument.content;
                updatePreview()
            } else if (response.status === 404) {
                // Meeting does not exist, create a new document
                console.log('Meeting not found, creating a new document...');
                await createNewMeeting();
            } else {
                throw new Error(`Unexpected response: ${response.status}`);
            }
        } else {
            // No document ID provided, create a new document
            console.log('No document ID found in URL, creating a new document...');
            await createNewMeeting();
        }
        
        // Add event listener for the delete button
        const deleteButton = document.getElementById('deleteButton');
        deleteButton.addEventListener('click', deleteDocument);

    } catch (error) {
        console.error('Error during document loading/creation:', error);
    }
});

// Function to create a new meeting with a template
async function createNewMeeting() {
    const newDocData = {
        title: 'Untitled Meeting',
        content: `# Meeting Title: [Descriptive title of the meeting]
**Meeting Date:** [YYYY-MM-DD]  
**Meeting Time:** [Start Time - End Time]  
**Location/Platform:** [Physical location or virtual platform]

## Participants
- **Chairperson:** [Name]  
- **Attendees:**  
  - [Participant 1]  
  - [Participant 2]  
- **Absent:**  
  - [Absent Member 1]  

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Points

### [Agenda Item 1 Title]
- **Key Points Discussed:**  
  [Summary of discussion]
- **Decisions Made:**  
  [Any decisions made regarding this item]
- **Action Items:**  
  - [Action Item 1]: [Responsible person], Deadline: [YYYY-MM-DD]

### [Agenda Item 2 Title]
- **Key Points Discussed:**  
  [Summary of discussion]
- **Decisions Made:**  
  [Any decisions made regarding this item]
- **Action Items:**  
  - [Action Item 2]: [Responsible person], Deadline: [YYYY-MM-DD]

## Action Items Summary
- [Action Item 1]: [Responsible person], Deadline: [YYYY-MM-DD]  
- [Action Item 2]: [Responsible person], Deadline: [YYYY-MM-DD]

## Next Meeting
- **Date:** [YYYY-MM-DD]  
- **Time:** [Start Time]  
- **Location/Platform:** [Physical location or virtual platform]

## Sign-off
- **Prepared By:** [Note taker name]  
- **Approved By:** [Chairperson name]  

**Minutes Circulated Date:** [YYYY-MM-DD]`,
        template_type: 'Minutes of Meeting'
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
        console.log('New meeting created:', result);

        // Update the UI with the new document's data
        document.getElementById('meetingName').value = newDocData.title;
        document.getElementById('markdown-editor').value = newDocData.content;

        // Store the new document ID and update the URL
        localStorage.setItem('meetingDocumentId', result.documentId);
        history.replaceState(null, '', `meeting.html?id=${result.documentId}`);
    } else {
        throw new Error('Failed to create a new document');
    }
}

// async function commitDocument() {
//     const saveButton = document.getElementById('commitid');
//     const saveStatus = document.getElementById('saveStatus');

//     // Get title and Markdown content
//     const meetingData = {
//         title: document.getElementById('meetingName').value || 'Untitled Meeting',
//         content: document.getElementById('markdown-editor').value || '', // Fetch Markdown content directly
//         template_type: 'Minutes of Meeting'
//     };

//     saveButton.disabled = true;
//     saveStatus.textContent = 'Running CLI command...';

//     try {
//         // Send data to the backend to save and commit the file
//         const response = await fetch('/run-command', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(meetingData), // Send the title and Markdown content
//         });

//         if (response.ok) {
//             const result = await response.text();
//             saveStatus.textContent = `Command output: ${result}`;
//         } else {
//             const error = await response.text();
//             saveStatus.textContent = `Error: ${error}`;
//         }
//     } catch (error) {
//         saveStatus.textContent = `Error: ${error.message}`;
//     } finally {
//         saveButton.disabled = false;
//     }
// }

async function commitDocument() {
    const saveButton = document.getElementById('commitid');
    const saveStatus = document.getElementById('saveStatus');

    // Retrieve the current document ID from localStorage
    const documentId = localStorage.getItem('meetingDocumentId') || Date.now().toString(); // Use timestamp if not available

    const meetingData = {
        documentId, // Include document ID
        title: document.getElementById('meetingName').value || 'Untitled Meeting',
        content: document.getElementById('markdown-editor').value || '', // Fetch Markdown content directly
        template_type: 'Minutes of Meeting'
    };

    saveButton.disabled = true;
    saveStatus.textContent = 'Running CLI command...';

    try {
        // Send data to the backend to save and commit the file
        const response = await fetch('/run-command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData), // Send the document ID, title, and content
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
// async function commitDocument() {
//     const saveButton = document.getElementById('commitid');
//     const saveStatus = document.getElementById('saveStatus');

//     // Get title and Markdown content
//     const meetingData = {
//         title: document.getElementById('meetingName').value || 'Untitled Meeting',
//         content: document.getElementById('markdown-editor').value || '', // Fetch Markdown content directly
//         template_type: 'Minutes of Meeting'
//     };

//     saveButton.disabled = true;
//     saveStatus.textContent = 'Running CLI command...';

//     try {
//         // Send data to the backend to save and commit the file
//         const response = await fetch('/run-command', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(meetingData), // Send the title and Markdown content
//         });

//         if (response.ok) {
//             const result = await response.text();
//             saveStatus.textContent = `Command output: ${result}`;
//         } else {
//             const error = await response.text();
//             saveStatus.textContent = `Error: ${error}`;
//         }
//     } catch (error) {
//         saveStatus.textContent = `Error: ${error.message}`;
//     } finally {
//         saveButton.disabled = false;
//     }
// }
// async function saveDocument() {
//     const saveButton = document.getElementById('saveButton');
//     const saveStatus = document.getElementById('saveStatus');
//     const meetingData = {
//         title: document.getElementById('meetingName').value || 'Untitled Meeting',
//         content: JSON.stringify({
//             text: document.getElementById('markdown-editor').value || '',
//         }),
//         template_type: 'Minutes of Meeting'
//     };
  
//     try {
//         saveButton.disabled = true;
//         saveStatus.textContent = 'Saving...';

//         const documentId = localStorage.getItem('meetingDocumentId');
//         if (!documentId) {
//             throw new Error('No document ID found');
//         }

//         const response = await fetch(`/api/documents/${documentId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(meetingData)
//         });

//         if (!response.ok) {
//             throw new Error('Failed to save document');
//         }

//         const result = await response.json();
//         console.log('Save result:', result);
//         saveStatus.textContent = 'Saved successfully';

//         // Redirect after successful save
//         setTimeout(() => {
//             window.location.href = '/';
//         }, 1000);

//     } catch (error) {
//         console.error('Save failed:', error);
//         saveStatus.textContent = `Failed to save: ${error.message}`;
        
//         // Try to create new document if update fails
//         try {
//             const createResponse = await fetch('/api/documents', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(meetingData)
//             });

//             if (createResponse.ok) {
//                 const newDoc = await createResponse.json();
//                 localStorage.setItem('meetingDocumentId', newDoc.documentId);
//                 window.location.href = '/';
//             }
//         } catch (createError) {
//             console.error('Failed to create new document:', createError);
//         }
//     } finally {
//         saveButton.disabled = false;
//     }
// }
async function saveDocument() {
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');

    // Get the current title and content from the UI
    const meetingData = {
        title: document.getElementById('meetingName').value || 'Untitled Meeting',
        content: document.getElementById('markdown-editor').value || '', // Fetch the latest Markdown content
        template_type: 'Minutes of Meeting'
    };

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        const documentId = localStorage.getItem('meetingDocumentId');
        if (!documentId) {
            throw new Error('No document ID found');
        }

        // Send the updated data to the server
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
        setTimeout(() => {
            saveStatus.textContent = '';
        }, 2000);

    } catch (error) {
        console.error('Save failed:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;

        // Attempt to create a new document if update fails
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


// ============= DELETE FUNCTION =============
async function deleteDocument() {
    const deleteButton = document.getElementById('deleteButton');
    const deleteStatus = document.getElementById('saveStatus');

    // Confirmation Dialog
    const confirmDelete = confirm('Are you sure you want to delete this feature specification? This action cannot be undone.');
    if (!confirmDelete) {
        return; // User canceled the deletion
    }

    try {
        deleteButton.disabled = true;
        deleteStatus.textContent = 'Deleting...';

        // Get current document ID from URL
        const pathParts = window.location.pathname.split('/');
        const documentId = pathParts[pathParts.length - 1];

        if (!documentId || documentId === 'feature') {
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