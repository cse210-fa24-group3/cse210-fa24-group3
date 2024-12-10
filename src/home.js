// Format relative time for entries
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

// Map template types to their respective page links
const TEMPLATE_LINKS = {
    'New Document': 'new-page/editor.html',
    'Todo': 'todo_template/todo.html',
    'Bug Report': 'bug-review.html',
    'Feature Specification': 'feature.html',
    'Minutes of Meeting': 'meeting.html'
};

// Create HTML for a single entry card
function createEntryCard(entry, isRecentlyEdited = false) {
    const link = TEMPLATE_LINKS[entry.template_type] || 'new-page/editor.html';

    if (isRecentlyEdited) {
        // For recently edited, only show title, template type, and last updated time
        return `
            <div class="entry-card">
                <h3>${entry.title || 'Untitled'}</h3>
                <p class="template-type">${entry.template_type}</p>
                <small>Last updated: ${formatRelativeTime(entry.updated_at)}</small>
                <a href="${link}?id=${entry.id}" class="btn">Open</a>
            </div>
        `;
    }

    // Original full entry card for other views
    const contentPreview = entry.content.length > 100 ? `${entry.content.substring(0, 100)}...` : entry.content;

    return `
        <div class="entry-card">
            <h3>${entry.title || 'Untitled'}</h3>
            <p>${contentPreview}</p>
            <small>Last updated: ${formatRelativeTime(entry.updated_at)}</small>
            <a href="${link}?id=${entry.id}" class="btn">Open</a>
        </div>
    `;
}

// Global variables to manage document display
let allDocuments = [];
let allRecentDocuments = [];
const INITIAL_DISPLAY_COUNT = 8;

// Fetch and display recently edited documents
async function fetchAndDisplayRecentlyEdited() {
    try {
        console.log('Fetching recently edited documents...');
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const documents = await response.json();
        console.log('Fetched recently edited documents:', documents);

        // Sort documents by updated_at in descending order
        allRecentDocuments = documents.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        displayRecentlyEdited();
    } catch (error) {
        console.error('Detailed error fetching recently edited documents:', error);
        const container = document.getElementById('recently-edited-container');
        container.innerHTML = `Error loading recent entries: ${error.message}`;
    }
}

// Display documents with option to show more
function displayDocuments(showAll = false) {
    const container = document.getElementById('entries');
    container.innerHTML = '';

    const documentsToShow = showAll ? allDocuments : allDocuments.slice(0, INITIAL_DISPLAY_COUNT);

    documentsToShow.forEach(doc => {
        container.innerHTML += createEntryCard(doc);
    });

    // Manage "See More" button visibility
    const seeMoreContainer = document.getElementById('see-more-container');
    if (seeMoreContainer) {
        if (allDocuments.length > INITIAL_DISPLAY_COUNT && !showAll) {
            seeMoreContainer.innerHTML = `
                <a href="#" id="see-more" class="see-more">See More (${allDocuments.length - INITIAL_DISPLAY_COUNT} more)</a>
            `;
            document.getElementById('see-more').addEventListener('click', (e) => {
                e.preventDefault();
                displayDocuments(true);
            });
        } else {
            seeMoreContainer.innerHTML = '';
        }
    }
}

// Display recently edited documents with option to show more
function displayRecentlyEdited(showAll = false) {
    const container = document.getElementById('recently-edited-container');
    const seeMoreButton = document.getElementById('see-more-button');
    container.innerHTML = '';

    const documentsToShow = showAll ? allRecentDocuments : allRecentDocuments.slice(0, INITIAL_DISPLAY_COUNT);

    documentsToShow.forEach(doc => {
        container.innerHTML += createEntryCard(doc, true);
    });

    // Manage "See More" button visibility
    if (allRecentDocuments.length > INITIAL_DISPLAY_COUNT) {
        seeMoreButton.style.display = showAll ? 'none' : 'block';
        
        if (!showAll) {
            seeMoreButton.textContent = `See More (${allRecentDocuments.length - INITIAL_DISPLAY_COUNT} more)`;
        }
    } else {
        seeMoreButton.style.display = 'none';
    }
}

// Function to refresh recently edited section
function refreshRecentlyEdited() {
    fetchAndDisplayRecentlyEdited();
    const event = new CustomEvent('document-saved');
    window.dispatchEvent(event);
}

const fetchDocuments = async () => {
    try {
        console.log('Fetching documents list...');
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const documents = await response.json();
        console.log('Fetched documents:', documents);

        const container = document.getElementById('document-list');
        // Check if container exists before trying to modify it
        if (!container) {
            console.error('Error: Could not find element with id "document-list"');
            return;
        }
        container.innerHTML = '';

        if (documents.length === 0) {
            container.innerHTML = '<p>No documents found.</p>';
            return;
        }

        documents.forEach(doc => {
            const documentDiv = document.createElement('div');
            documentDiv.className = 'document-item';
            documentDiv.innerHTML = `
                <h3>${doc.title}</h3>
                <p>${new Date(doc.created_at).toLocaleString()}</p>
                <button onclick="openDocument('${doc.id}')">Open</button>
                <button onclick="deleteDocument('${doc.id}')">Delete</button>
            `;
            container.appendChild(documentDiv);
        });
    } catch (error) {
        console.error('Detailed error fetching documents:', error);
        const alertMessage = error.message || 'Failed to fetch documents. Please try again later.';
        alert(alertMessage);
    }
};

// Open document in the correct page
const openDocument = async (id) => {
    try {
        const response = await fetch(`/api/documents/${id}`);
        if (response.status === 404) {
            alert('Document not found.');
            return;
        }
        const document = await response.json();
        const link = TEMPLATE_LINKS[document.template_type] || 'new-page/editor.html';
        window.location.href = `${link}?id=${document.id}`;
    } catch (error) {
        console.error('Error opening document:', error);
        alert('Failed to open document. Please try again later.');
    }
};

// Delete document
const deleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }
    try {
        const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Document deleted successfully.');
            fetchDocuments(); // Refresh document list
        } else {
            alert('Failed to delete document.');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again later.');
    }
    // Make sure the element exists before calling fetchDocuments
    if (document.getElementById('document-list')) {
        fetchDocuments();
    } else {
        console.error('Error: Could not find element with id "document-list"');
    }

    // Check if these elements exist before calling their respective functions
    if (document.getElementById('entries')) {
        fetchAndDisplayDocuments();
    }
    if (document.getElementById('recently-edited-container')) {
        fetchAndDisplayRecentlyEdited();
    }
};

// Add event listener for "See More" button in the recently edited section
document.addEventListener('DOMContentLoaded', () => {
    const seeMoreButton = document.getElementById('see-more-button');
    if (seeMoreButton) {
        seeMoreButton.addEventListener('click', () => {
            displayRecentlyEdited(true);
        });
    }
});
// Fetch and display recently edited documents on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing recently edited documents...');
    fetchAndDisplayRecentlyEdited();
});

// Utility functions for page navigation
function createNewBugReviewFromTemplate() {
    window.location.href = 'bug-review.html';
}

function createNewFeatureFromTemplate() {
    window.location.href = 'feature.html';
}

function createNewMeetingFromTemplate() {
    window.location.href = 'meeting.html';
}

function openTodoPage() {
    window.location.href = 'todo_template/todo.html';
}