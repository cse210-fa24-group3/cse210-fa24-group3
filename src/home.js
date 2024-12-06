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
    'todo': 'todo_template/todo.html',
    'Bug Report': 'bug-review.html',
    'Feature Specification': 'feature.html',
    'Minutes of Meeting': 'meeting.html'
};

// Create HTML for a single entry card
function createEntryCard(entry) {
    // Attempt to parse content for better preview
    let parsedContent = entry.content;
    try {
        // For JSON-based templates, try to parse and extract meaningful content
        const parsedContentObj = JSON.parse(entry.content);
        parsedContent = parsedContentObj.text || 
                        parsedContentObj.tasks?.map(task => task.text).join(' ') || 
                        entry.content;
    } catch (error) {
        // If parsing fails, use original content
    }

    const truncatedContent = parsedContent 
        ? parsedContent.length > 100 
            ? parsedContent.substring(0, 100) + '...'
            : parsedContent
        : 'No content';

    // Determine link based on template type, defaulting to editor if not found
    const link = `${TEMPLATE_LINKS[entry.template_type] || 'new-page/editor.html'}?id=${entry.id}`;

    return `
        <div class="card entry-card">
            <a href="${link}" class="entry-link">
                <div class="entry-type">${entry.template_type}</div>
                <h3 class="entry-title">${entry.title || 'Untitled'}</h3>
                <p class="entry-preview">${truncatedContent}</p>
                <div class="entry-meta">
                    <span class="entry-time">Last edited: ${formatRelativeTime(entry.updated_at)}</span>
                </div>
            </a>
        </div>
    `;
}

// Load recent entries
let showAllEntries = false; // Track whether to show all entries
let displayLimit = 6; // Default number of entries to show

async function loadRecentEntries() {
    const container = document.getElementById('recently-edited-container');
    const seeMoreButton = document.getElementById('see-more-button');
    
    try {
        const response = await fetch('http://localhost:3000/api/documents');
        const entries = await response.json();

        // Sort entries by most recently updated
        const sortedEntries = entries.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        );

        // Determine entries to display
        const entriesToDisplay = showAllEntries 
            ? sortedEntries 
            : sortedEntries.slice(0, displayLimit);

        if (!entriesToDisplay || entriesToDisplay.length === 0) {
            container.innerHTML = '<div class="card no-entries">No entries yet. Create your first entry!</div>';
            if (seeMoreButton) seeMoreButton.style.display = 'none';
            return;
        }

        // Generate HTML for entries
        const entriesHTML = entriesToDisplay
            .map(entry => createEntryCard(entry))
            .join('');

        container.innerHTML = entriesHTML;

        // Update See More button visibility
        if (seeMoreButton) {
            seeMoreButton.textContent = showAllEntries ? 'Show Less' : 'See More';
            seeMoreButton.style.display = sortedEntries.length > displayLimit ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error loading entries:', error);
        container.innerHTML = `
            <div class="card error-card">
                Failed to load entries. Please try again later.
                Error details: ${error.message}
            </div>
        `;
    }
}

// Toggle showAllEntries and reload
function toggleSeeMore() {
    showAllEntries = !showAllEntries;
    loadRecentEntries();
}

// Create new document for a specific template
async function createNewDocument(templateType) {
    try {
        // Map template types to their respective API endpoints
        const templateEndpoints = {
            'New Document': '/api/documents',
            'todo': '/api/documents/new-todo',
            'Bug Report': '/api/documents/new-bug-review',
            'Feature Specification': '/api/documents/new-feature',
            'Minutes of Meeting': '/api/documents/new-meeting'
        };

        const endpoint = templateEndpoints[templateType];
        if (!endpoint) {
            console.error('Unknown template type:', templateType);
            return null;
        }

        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newDocument = await response.json();
        
        // Redirect to the appropriate template page
        const links = {
            'New Document': `new-page/editor.html?id=${newDocument.documentId}`,
            'todo': `todo_template/todo.html?id=${newDocument.documentId}`,
            'Bug Report': `bug-review.html?id=${newDocument.documentId}`,
            'Feature Specification': `feature.html?id=${newDocument.documentId}`,
            'Minutes of Meeting': `meeting.html?id=${newDocument.documentId}`
        };

        window.location.href = links[templateType];

    } catch (error) {
        console.error('Error creating new document:', error);
        alert('Failed to create new document. Please try again.');
    }
}

// Template-specific creation functions
function createNewBugReviewFromTemplate() {
    createNewDocument('Bug Report');
}

function createNewFeatureFromTemplate() {
    createNewDocument('Feature Specification');
}

function createNewMeetingFromTemplate() {
    createNewDocument('Minutes of Meeting');
}

function createNewTodoFromTemplate() {
    createNewDocument('todo');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load recent entries
    loadRecentEntries();

    // Add click handlers for template creation buttons
    const templateCards = document.querySelectorAll('.card-grid .card');
    templateCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Get template type from text
            const templateText = e.target.textContent.trim();
            const templateTypeMap = {
                'To-do list': 'todo',
                'Bug - Root Cause Analysis': 'Bug Report',
                'Feature Specification': 'Feature Specification',
                'Minutes of Meeting': 'Minutes of Meeting'
            };

            const templateType = templateTypeMap[templateText];
            if (templateType) {
                createNewDocument(templateType);
            }
        });
    });

    // Add event listener to "See More" button
    const seeMoreButton = document.getElementById('see-more-button');
    if (seeMoreButton) {
        seeMoreButton.addEventListener('click', toggleSeeMore);
    }

    // Create Journal Entry card
    document.querySelector('.create-card').addEventListener('click', (e) => {
        createNewDocument('New Document');
    });
});