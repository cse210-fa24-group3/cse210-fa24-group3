// Update date on page load

const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Write your bug review here...',
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['link', 'image', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['clean'],
        ],
    },
});
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Auto-save functionality
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocument, 30000);
}

document.addEventListener('DOMContentLoaded', async function () {
    updateDate();

    const titleInput = document.getElementById('titleInput');
    const saveButton = document.getElementById('saveButton');
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('id');

    if (documentId) {
        try {
            // Fetch document data
            const response = await fetch(`/api/documents/${documentId}`);
            
            if (response.ok) {
                const loadDocument = await response.json();

                // Set title
                if (titleInput) {
                    titleInput.value = loadDocument.title || '';
                }

                // Parse and set Quill content
                const content = JSON.parse(loadDocument.content || '{}');
                if (content.delta) {
                    quill.setContents(content.delta); // Use Delta format for Quill
                } else if (content.html) {
                    quill.root.innerHTML = content.html; // Fallback to HTML content
                }
            } else {
                console.error('Failed to fetch document:', await response.text());
            }
        } catch (error) {
            console.error('Error loading document:', error);
        }
    } else {
        console.log('No document ID found, creating a new document.');

        try {
            // Create a new document
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'New Bug Report',
                    content: JSON.stringify({ delta: {}, html: '' }),
                    template_type: 'Bug Report'
                })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('currentDocumentId', result.documentId);
                history.replaceState(null, '', `bug-review.html?id=${result.documentId}`);
            }
        } catch (error) {
            console.error('Error creating new document:', error);
        }
    }

    // Add save button listener
    if (saveButton) {
        saveButton.addEventListener('click', saveDocument);
    }
});

function updatePriorityTag() {
    const prioritySelect = document.getElementById('priority-select');
    const priorityTag = document.getElementById('priority-tag');
    const selectedPriority = prioritySelect.value;

    // Update text
    priorityTag.textContent = selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1);

    // Update class
    priorityTag.className = `priority-tag priority-${selectedPriority}`;
}
async function fetchGitHubIssues() {
    const repo = 'cse210-fa24-group3/cse210-fa24-group3';
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/issues`);
        const issues = await response.json();
        const issueTags = issues
            .map(issue => `
                <span class="issue-tag" title="Click to view more" onclick="window.open('${issue.html_url}', '_blank')">
                    ${issue.title}
                </span>
            `)
            .join('');
        document.getElementById('github-issues').innerHTML = issueTags;
    } catch (error) {
        document.getElementById('github-issues').innerHTML = 'Failed to load issues.';
        console.error('Error fetching GitHub issues:', error);
    }
}

// Call the function when the page loads

fetchGitHubIssues();
function goToHome() {
    window.location.href = '/';
}

async function saveDocument() {
    console.log('Save document called');
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');
    const titleInput = document.getElementById('titleInput');

    // Ensure all required elements exist
    if (!saveButton || !saveStatus || !titleInput) {
        console.error('Required DOM elements are missing');
        return;
    }

    const documentId = localStorage.getItem('currentDocumentId');

    console.log('Current document ID:', documentId);

    if (!documentId) {
        console.error('No document ID found');
        saveStatus.textContent = 'Error: No document ID';
        return;
    }

    try {
        saveButton.disabled = true;
        saveStatus.textContent = 'Saving...';

        // Fetch Quill's content
        const contentDelta = quill.getContents(); // Quill's Delta format
        const contentHTML = quill.root.innerHTML; // HTML content

        // Prepare the data to be sent
        const bugData = {
            title: titleInput.value,
            content: JSON.stringify({
                delta: contentDelta, // Save Delta format
                html: contentHTML   // Save HTML content
            }),
            template_type: 'Bug Report'
        };

        console.log('Saving document data:', bugData);

        const response = await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bugData)
        });

        console.log('Save response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Save failed:', errorText);
            throw new Error(`Failed to save document: ${errorText}`);
        }

        // Trigger document-saved event for other parts of the app
        const event = new CustomEvent('document-saved');
        window.dispatchEvent(event);

        saveStatus.textContent = 'Saved successfully!';
    } catch (error) {
        console.error('Detailed save error:', error);
        saveStatus.textContent = `Failed to save: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
}
// Additional error handling for page load issues
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
    alert('An unexpected error occurred. Please check the console for details.');
});