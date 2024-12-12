// feature.js
document.addEventListener('DOMContentLoaded', function() {
    // Get references to all important elements
    const saveButton = document.getElementById('saveButton');
    // const commitButton = document.getElementById('commitButton');
    const deleteButton = document.getElementById('deleteButton');
    const saveStatus = document.getElementById('saveStatus');
    const titleInput = document.getElementById('meetingName');
    const contentArea = document.getElementById('markdown-editor');
    
    // Function to get document ID from URL
    function getDocumentId() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('Current document ID:', id);
        return id;
    }

    // Function to load or create document
    async function loadOrCreateDocument() {
        const documentId = getDocumentId();
        
        if (!documentId) {
            console.log('No document ID - creating new document');
            // Load default template content
            contentArea.value = `# Feature Specification

## Overview
[Provide a brief overview of the feature]

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

## Technical Design
[Describe the technical implementation details]

## Testing Strategy
[Outline the testing approach]

## Acceptance Criteria
- [Criterion 1]
- [Criterion 2]`;
            
            // Trigger save to create new document
            await saveDocument();
        } else {
            try {
                const response = await fetch(`/api/documents/${documentId}`);
                if (response.ok) {
                    const doc = await response.json();
                    titleInput.value = doc.title || 'Untitled Feature';
                    contentArea.value = doc.content || '';
                    console.log('Document loaded:', doc);
                } else {
                    console.error('Failed to load document');
                    saveStatus.textContent = 'Failed to load document';
                }
            } catch (error) {
                console.error('Load error:', error);
                saveStatus.textContent = `Error: ${error.message}`;
            }
        }
    }

    async function saveDocument() {
        const saveButton = document.getElementById('saveButton');
        const saveStatus = document.getElementById('saveStatus');
        let documentId = new URLSearchParams(window.location.search).get('id') 
                        || localStorage.getItem('meetingDocumentId');
    
        const featureData = {
            title: document.getElementById('meetingName').value || 'Untitled Feature',
            content: document.getElementById('markdown-editor').value || '', 
            template_type: 'Feature Specification'
        };
    
        try {
            saveButton.disabled = true;
            saveStatus.textContent = 'Saving...';
    
            let response;
            
            if (!documentId) {
                response = await fetch('/api/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(featureData)
                });
    
                if (response.ok) {
                    const result = await response.json();
                    documentId = result.documentId;
                    localStorage.setItem('meetingDocumentId', documentId);
                    history.replaceState(null, '', `?id=${documentId}`);
                }
            } else {
                response = await fetch(`/api/documents/${documentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(featureData)
                });
            }
    
            if (response.ok) {
                saveStatus.textContent = 'Saved successfully';
            } else {
                throw new Error('Failed to save document');
            }
    
        } catch (error) {
            console.error('Save failed:', error);
            saveStatus.textContent = 'Failed to save';
        } finally {
            saveButton.disabled = false;
            setTimeout(() => {
                saveStatus.textContent = '';
            }, 2000);
        }
    }

    // Delete document function
    async function deleteDocument() {
        console.log('Delete button clicked');
        const documentId = getDocumentId();

        if (!documentId) {
            console.error('No document ID found');
            saveStatus.textContent = 'Error: No document ID';
            return;
        }

        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }

        try {
            deleteButton.disabled = true;
            saveStatus.textContent = 'Deleting...';

            const response = await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE'
            });

            console.log('Delete response status:', response.status);

            if (response.ok) {
                saveStatus.textContent = 'Document deleted. Redirecting...';
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Delete error:', error);
            saveStatus.textContent = `Error: ${error.message}`;
        } finally {
            deleteButton.disabled = false;
        }
    }

    /**
 * Downloads the feature document as a PDF.
 * Converts the markdown content to PDF and triggers the download.
 */
async function downloadFeaturePDF() {
    const title = document.getElementById('meetingName').value.trim() || 'Untitled Feature';
    const content = document.getElementById('markdown-editor').value;
    
    try {
        const response = await fetch('/api/download-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }

        // Get the PDF blob from the response
        const blob = await response.blob();
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Download failed:', error);
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.textContent = 'Failed to download PDF';
        saveStatus.style.color = 'red';
        setTimeout(() => {
            saveStatus.textContent = '';
        }, 2000);
    }
}

    // Add event listeners
    if (saveButton) {
        console.log('Adding save button listener');
        saveButton.addEventListener('click', saveDocument);
    } else {
        console.error('Save button not found');
    }

    if (deleteButton) {
        console.log('Adding delete button listener');
        deleteButton.addEventListener('click', deleteDocument);
    } else {
        console.error('Delete button not found');
    }

    // Load or create document when page loads
    loadOrCreateDocument();

    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        console.log('Adding download button listener');
        downloadButton.addEventListener('click', downloadFeaturePDF);
    }

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const lightModeIcon = document.querySelector('.light-mode');
    const darkModeIcon = document.querySelector('.dark-mode');

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    // Toggle theme function
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    }

    // Update theme icons visibility
    function updateThemeIcons(theme) {
        if (theme === 'dark') {
            lightModeIcon.style.display = 'none';
            darkModeIcon.style.display = 'inline';
        } else {
            lightModeIcon.style.display = 'inline';
            darkModeIcon.style.display = 'none';
        }
    }

    // Add click event listener to theme toggle
    themeToggle.addEventListener('click', toggleTheme);
});