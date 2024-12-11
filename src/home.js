/**
 * Returns a human-friendly format of a relative time string.
 *
 * @param {string} dateString - A date string in a format that can be parsed by the JavaScript Date constructor.
 * @return {string} A relative time string in the format "just now", "Xm ago", "Xh ago", or "Xday ago", or a full date string with month, day, and year if the time difference is larger than one week.
 */
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


/**
 * A object containing various template links. Each key is a label, and each value is the corresponding template URL.
 */
const TEMPLATE_LINKS = {
    'New Document': 'new-page/editor.html',
    'Todo': 'todo_template/todo.html',
    'Bug Report': 'bug-review.html',
    'Feature Specification': 'feature.html',
    'Minutes of Meeting': 'meeting.html'
};

// Create HTML for a single entry card
/**
 * Create an entry card for an entry.
 *
 * @param {Object} entry - The entry to create a card for.
 * @param {boolean} [isRecentlyEdited=false] - Whether the card should display the recently edited version.
 * @returns {string} The HTML for the entry card.
 */
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
/**
 * Fetches and displays the recently edited documents.
 *
 * Logs a message to the console while fetching, handles HTTP errors,
 * sorts the documents by updated_at in descending order, and displays them.
 *
 * @throws {Error} If an HTTP error occurs.
 */
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

/**
 * Displays a list of documents in the given container.
 * If `showAll` is true, displays all documents; otherwise, displays only a limited number of documents.
 * @param {boolean} [showAll=false] - Whether to display all documents or not.
 */
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

/**
 * Displays a list of recently edited documents.
 *
 * @param {boolean} showAll - whether to display all documents or only a subset
 */
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


/**
 * Sends a custom event to the window after refreshRecentlyEdited() operations have been completed.
 * Firstly, it calls fetchAndDisplayRecentlyEdited() to handle the recent edits, and then fires a 'document-saved'
 * event to notify any event listeners.
 */
function refreshRecentlyEdited() {
    fetchAndDisplayRecentlyEdited();
    const event = new CustomEvent('document-saved');
    window.dispatchEvent(event);
}

/**
 * Fetches documents list and updates the document list container.
 *
 * Logs messages to the console and handles errors.
 * If an error occurs, displays an alert with the error message.
 */
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


/**
 * Opens a document by its ID.
 *
 * Sends a GET request to the API to retrieve the document, and then navigates to the document's page.
 * If the document is not found, displays an error message.
 *
 * @param {string} id - The ID of the document to open.
 */
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


/**
 * Deletes a document and refreshes the document list.
 * Prompts the user to confirm before deleting.
 *
 * @param {string} id - The ID of the document to delete
 */
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

/**
 * Initializes UI elements to display recently edited items when the 'see more' button is clicked.
 */
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

/**
 * Navigates to a new page based on the provided template.
 *
 * If called without an argument, defaults to the bug review page.
 *
 * @memberof module:Templates
 */
function createNewBugReviewFromTemplate() {
    window.location.href = 'bug-review.html';
}

function createNewFeatureFromTemplate() {
    window.location.href = 'feature.html';
}

function createNewMeetingFromTemplate() {
    window.location.href = 'meeting.html';
}

function createAI() {
    window.location.href = 'coder.html';
}

function openTodoPage() {
    window.location.href = 'todo_template/todo.html';
}
/**
 * Opens the GitHub modal.
 * Fetches and fills credentials if a cached username is found in local storage.
 */
async function openModal() {
    document.getElementById('github-modal').style.display = 'block';

    // Check localStorage for cached username
    const cachedUsername = localStorage.getItem('github-username');
    if (cachedUsername) {
        console.log('Using cached username:', cachedUsername);

        // Fetch SSH key for cached username
        await fetchAndFillCredentials(cachedUsername);
    } else {
        console.log('No cached username found. Please configure credentials manually.');
    }
}
/**
 * Fetches and fills GitHub credentials for the given username.
 *
 * @param {string} username - The GitHub username to fetch credentials for.
 * @returns {void}
 */
async function fetchAndFillCredentials(username) {
    try {
        const response = await fetch(`/api/get-github-credentials?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub credentials.');
        }

        const { username: fetchedUsername, ssh_key } = await response.json();

        document.getElementById('github-username').value = fetchedUsername || '';
        document.getElementById('github-ssh-key').value = ssh_key || '';
    } catch (error) {
        console.error('Error fetching GitHub credentials:', error);
        alert('Unable to fetch GitHub credentials.');
    }
}

/**
 * Saves GitHub credentials to the backend.
 *
 * @returns {void}
 */
async function saveGithubCredentials() {
    const username = document.getElementById('github-username').value.trim();
    const sshKey = document.getElementById('github-ssh-key').value.trim();

    if (!username || !sshKey) {
        alert('Please fill out both fields.');
        return;
    }

    try {
        console.log('Sending GitHub credentials to the backend:', { username, sshKey });

        const response = await fetch('/api/save-github-credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, sshKey }), // Send data as JSON
        });

        if (response.ok) {
            const result = await response.text();
            console.log('Credentials saved successfully:', result);

            // Update the cache
            localStorage.setItem('github-username', username);

            alert('GitHub credentials saved successfully!');
            closeModal();
        } else {
            const error = await response.text();
            console.error('Failed to save credentials:', error);
            alert(`Failed to save credentials: ${error}`);
        }
    } catch (error) {
        console.error('Error during credentials save operation:', error);
        alert('An error occurred while saving credentials.');
    }
}
/**
 * Closes the specified modal.
 */
function closeModal() {
    document.getElementById('github-modal').style.display = 'none';
}
/**
 * Retrieves GitHub credentials, either by fetching a cached username or by executing
 * a login flow.
 */
async function getGithubCredentials() {
    const cachedUsername = localStorage.getItem('github-username');
    if (cachedUsername) {
        console.log('Fetching credentials for cached username:', cachedUsername);
        await fetchAndFillCredentials(cachedUsername);
    } else {
        console.log('No cached username found.');
    }
}