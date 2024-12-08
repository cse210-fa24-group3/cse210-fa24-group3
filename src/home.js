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
function createEntryCard(entry) {
    const contentPreview = entry.content.length > 100 ? `${entry.content.substring(0, 100)}...` : entry.content;
    const link = TEMPLATE_LINKS[entry.template_type] || 'new-page/editor.html';

    return `
        <div class="entry-card">
            <h3>${entry.title || 'Untitled'}</h3>
            <p>${contentPreview}</p>
            <small>Last updated: ${formatRelativeTime(entry.updated_at)}</small>
            <a href="${link}?id=${entry.id}" class="btn">Open</a>
        </div>
    `;
}

// Fetch and display all documents
async function fetchAndDisplayDocuments() {
    try {
        console.log('Fetching documents...');
        const response = await fetch('/api/documents');
        
        // Log the full response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const documents = await response.json();
        console.log('Fetched documents:', documents);

        const container = document.getElementById('entries');
        container.innerHTML = '';

        documents.forEach(doc => {
            container.innerHTML += createEntryCard(doc);
        });
    } catch (error) {
        console.error('Detailed error fetching documents:', error);
        const container = document.getElementById('entries');
        container.innerHTML = `Error loading entries: ${error.message}`;
    }
}

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

        const container = document.getElementById('recently-edited-container');
        container.innerHTML = '';

        documents.forEach(doc => {
            container.innerHTML += createEntryCard(doc);
        });
    } catch (error) {
        console.error('Detailed error fetching recently edited documents:', error);
        const container = document.getElementById('recently-edited-container');
        container.innerHTML = `Error loading recent entries: ${error.message}`;
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
};

// Initialize document list on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing document fetching...');
    fetchDocuments();
    fetchAndDisplayDocuments();
    fetchAndDisplayRecentlyEdited();

    // Listen for custom event from editor page
    window.addEventListener('document-saved', refreshRecentlyEdited);
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