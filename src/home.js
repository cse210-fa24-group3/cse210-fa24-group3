/**
 * Returns a human-friendly format of a relative time string.
 * @ignore
 * @param {string} dateString - A date string in a format that can be parsed by the JavaScript Date constructor.
 * @return {string} A relative time string in the format "just now", "Xm ago", "Xh ago", or "Xday ago", or a full date string with month, day, and year if the time difference is larger than one week.

 */


document.addEventListener('DOMContentLoaded', () => {
    // Function to update theme for recently edited cards
    function updateRecentlyEditedTheme() {
        const recentlyEditedContainer = document.getElementById('recently-edited-container');
        if (!recentlyEditedContainer) return;
    
        const isDarkMode = document.body.classList.contains('dark-mode');
        const cards = recentlyEditedContainer.querySelectorAll('.entry-card');
    
        cards.forEach(card => {
            if (isDarkMode) {
                card.classList.add('dark-mode');
            } else {
                card.classList.remove('dark-mode');
            }
        });
    }
    window.addEventListener('theme-toggled', updateRecentlyEditedTheme);

// Initial theme sync after documents are loaded
document.addEventListener('recently-edited-loaded', updateRecentlyEditedTheme);

// Modify the existing theme toggle functionality in script.js
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.querySelector('.light-mode').style.display = document.body.classList.contains('dark-mode') ? 'none' : 'block';
    darkModeToggle.querySelector('.dark-mode').style.display = document.body.classList.contains('dark-mode') ? 'block' : 'none';
    
    // Save preference
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');

    // Dispatch custom event for theme toggling
    const event = new Event('theme-toggled');
    window.dispatchEvent(event);
});
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const lightModeIcon = document.querySelector('.light-mode');
    const darkModeIcon = document.querySelector('.dark-mode');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        lightModeIcon.style.display = document.body.classList.contains('dark-mode') ? 'none' : 'inline';
        darkModeIcon.style.display = document.body.classList.contains('dark-mode') ? 'inline' : 'none';
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
        
        updateRecentlyEditedTheme();
    });
});

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

const TEMPLATE_LINKS = {
    'Todo': 'todo_template/todo.html',
    'Bug Report': 'bug-review/bug-review.html',
    'Feature Specification': 'feature.html',
    'Minutes of Meeting': 'meeting.html'
};


// Create HTML for a single entry card
/** 
 * Create an entry card for an entry.
 *@ignore
 * @param {Object} entry - The entry to create a card for.
 * @param {boolean} [isRecentlyEdited=false] - Whether the card should display the recently edited version.
 * @returns {string} The HTML for the entry card.
 */
 function createEntryCard(entry, isRecentlyEdited = false) {
    const link = TEMPLATE_LINKS[entry.template_type] || 'new-page/editor.html';
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isRecentlyEdited) {
        return `
            <div class="entry-card ${isDarkMode ? 'dark-mode' : ''}">
                <div class="entry-content">
                    <div>
                        <h3>${entry.title || 'Untitled'}</h3>
                        <p class="template-type">${entry.template_type}</p>
                        <small>Last updated: ${formatRelativeTime(entry.updated_at)}</small>
                    </div>
                    <a href="${link}?id=${entry.id}" class="entry-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }

    const contentPreview = entry.content.length > 100 ? `${entry.content.substring(0, 100)}...` : entry.content;

    return `
        <div class="entry-card ${isDarkMode ? 'dark-mode' : ''}">
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
 * @ignore
 * Logs a message to the console while fetching, handles HTTP errors,
 * sorts the documents by updated_at in descending order, and displays them.
 *@ignore
 * @throws {Error} If an HTTP error occurs.
 */
// Listen for document deletion events
window.addEventListener('message', (event) => {
    if (event.data.type === 'document-deleted') {
        console.log('Document deleted, refreshing lists...');
        // Refresh the recently edited documents
        fetchAndDisplayRecentlyEdited();
        // Refresh the main document list if it exists
        if (typeof fetchDocuments === 'function') {
            fetchDocuments();
        }
    }
});

// Also listen for the custom event
window.addEventListener('document-deleted', (event) => {
    console.log('Document deleted event received, refreshing lists...');
    fetchAndDisplayRecentlyEdited();
    if (typeof fetchDocuments === 'function') {
        fetchDocuments();
    }
});

// Enhance the existing fetchAndDisplayRecentlyEdited function to handle empty states
// Fetch and display recently edited documents on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing recently edited documents...');
    fetchAndDisplayRecentlyEdited();
});

/**
 * Fetches and displays the recently edited documents.
 * @ignore
 * Logs a message to the console while fetching, handles HTTP errors,
 * sorts the documents by updated_at in descending order, and displays them.
 *@ignore
 * @throws {Error} If an HTTP error occurs.
 */
async function fetchAndDisplayRecentlyEdited() {
    try {
        console.log('Fetching recently edited documents...');
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const documents = await response.json();
        console.log('Fetched recently edited documents:', documents);

        // Sort documents by updated_at in descending order
        allRecentDocuments = documents.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        );

        const container = document.getElementById('recently-edited-container');
        if (container) {
            // If no documents, show a message
            if (allRecentDocuments.length === 0) {
                container.innerHTML = '<p>No recent entries found.</p>';
            } else {
                // Display the initial set of documents
                displayRecentlyEdited();
            }
        }

        // Dispatch event after recently edited documents are loaded
        const event = new Event('recently-edited-loaded');
        window.dispatchEvent(event);
    } catch (error) {
        console.error('Error fetching recently edited documents:', error);
        const container = document.getElementById('recently-edited-container');
        if (container) {
            container.innerHTML = `<p>Error loading recent entries: ${error.message}</p>`;
        }
    }
}function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Explicitly update recently edited section
    const recentlyEditedContainer = document.getElementById('recently-edited-container');
    const cards = recentlyEditedContainer.querySelectorAll('.entry-card');
    
    cards.forEach(card => {
        if (document.body.classList.contains('dark-mode')) {
            card.classList.add('dark-mode');
        } else {
            card.classList.remove('dark-mode');
        }
    });
    
    // Dispatch custom event for theme toggling
    const event = new Event('theme-toggled');
    window.dispatchEvent(event);

    // Optional: Save theme preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
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
// Global variables to manage document display
let allDocuments = [];
let allRecentDocuments = [];
const INITIAL_DISPLAY_COUNT = 8;

/**
 * Displays a list of recently edited documents.
 *
 * @param {boolean} showAll - whether to display all documents or only a subset
 */
function displayRecentlyEdited(showAll = false) {
    const container = document.getElementById('recently-edited-container');
    const seeMoreContainer = document.getElementById('see-more-container');
    
    // Clear previous content
    container.innerHTML = '';

    // If there are no recent documents, show a message
    if (allRecentDocuments.length === 0) {
        container.innerHTML = '<p>No recent entries found.</p>';
        if (seeMoreContainer) {
            seeMoreContainer.style.display = 'none';
        }
        return;
    }

    const documentsToShow = showAll ? allRecentDocuments : allRecentDocuments.slice(0, INITIAL_DISPLAY_COUNT);

    documentsToShow.forEach(doc => {
        container.innerHTML += createEntryCard(doc, true);
    });

    // Manage "See More" link visibility
    if (seeMoreContainer) {
        if (allRecentDocuments.length > INITIAL_DISPLAY_COUNT) {
            if (!showAll) {
                const remainingCount = allRecentDocuments.length - INITIAL_DISPLAY_COUNT;
                seeMoreContainer.innerHTML = `<a href="#" class="see-more">See More (${remainingCount} more)</a>`;
                seeMoreContainer.style.display = 'block';
                
                // Add click event to see more link
                seeMoreContainer.querySelector('.see-more').addEventListener('click', (e) => {
                    e.preventDefault();
                    displayRecentlyEdited(true);
                });
            } else {
                // Hide see more container when all items are shown
                seeMoreContainer.style.display = 'none';
            }
        } else {
            // Hide see more container if no more items to show
            seeMoreContainer.style.display = 'none';
        }
    }
}
/**
 * Sends a custom event to the window after refreshRecentlyEdited() operations have been completed.
 * Firstly, it calls AndDisplayRecentlyEdited() to handle the recent edits, and then fires a 'document-saved'
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
        // eslint-disable-next-line no-undef
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
    window.location.href = '/bug-review/bug-review.html';
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
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
