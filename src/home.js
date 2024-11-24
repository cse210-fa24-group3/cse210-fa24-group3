// Format date to relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// Truncate text to a specific length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + '...';
}

// Create HTML for a single entry tile
function createEntryTile(entry) {
    const tile = document.createElement('div');
    tile.className = 'entry-tile';
    tile.onclick = () => window.location.href = `new-page/editor.html?id=${entry.id}`;

    tile.innerHTML = `
        <h3 class="entry-title">${entry.title}</h3>
        <p class="entry-preview">${truncateText(entry.content, 150)}</p>
        <div class="entry-meta">
            ${formatRelativeTime(entry.createdAt)}
        </div>
    `;

    return tile;
}

// Display all entries
function displayEntries() {
    const entriesGrid = document.getElementById('entries-grid');
    const entries = JSON.parse(localStorage.getItem('entries') || '[]');

    if (entries.length === 0) {
        entriesGrid.innerHTML = `
            <div class="no-entries">
                No entries yet. Click "Create New" to get started!
            </div>
        `;
        return;
    }

    entriesGrid.innerHTML = '';
    entries.forEach(entry => {
        entriesGrid.appendChild(createEntryTile(entry));
    });
}

// Initial load of entries
// displayEntries();
