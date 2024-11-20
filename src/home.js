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

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + '...';
}

function createEntryTile(entry, isRecentlyViewed = false) {
    const tile = document.createElement('div');
    tile.className = `entry-tile ${isRecentlyViewed ? 'recently-viewed' : ''}`;
    tile.onclick = () => window.location.href = `new-page/editor.html?id=${entry.id}`;

    tile.innerHTML = `
        <h3 class="entry-title">${entry.title}</h3>
        <p class="entry-preview">${truncateText(entry.content, 150)}</p>
        <div class="entry-meta">
            ${formatRelativeTime(entry.created_at)}
        </div>
    `;

    return tile;
}

function getRecentlyViewedEntries() {
    try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        return recentlyViewed.slice(0, 3); // Limit to 3 recent entries
    } catch (error) {
        console.error('Error parsing recently viewed entries:', error);
        return [];
    }
}

async function displayEntries() {
    const entriesGrid = document.getElementById('entries-grid');
    
    try {
        const response = await fetch('http://localhost:3000/api/entries');
        const entries = await response.json();

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
    } catch (error) {
        console.error('Error fetching entries:', error);
        entriesGrid.innerHTML = `
            <div class="error-message">
                Failed to load entries. Please try again later.
            </div>
        `;
    }
}

async function displayRecentlyViewedEntries() {
    const recentlyViewedSection = document.getElementById('recently-viewed-section');
    const recentlyViewedGrid = document.getElementById('recently-viewed-grid');
    
    try {
        const response = await fetch('http://localhost:3000/api/entries');
        const entries = await response.json();
        const recentlyViewedIds = getRecentlyViewedEntries();

        if (recentlyViewedIds.length > 0) {
            const recentlyViewedEntries = entries.filter(entry => 
                recentlyViewedIds.includes(entry.id)
            ).sort((a, b) => {
                return recentlyViewedIds.indexOf(a.id) - recentlyViewedIds.indexOf(b.id);
            });

            if (recentlyViewedEntries.length > 0) {
                recentlyViewedGrid.innerHTML = '';
                recentlyViewedEntries.forEach(entry => {
                    const tile = createEntryTile(entry, true);
                    recentlyViewedGrid.appendChild(tile);
                });
                recentlyViewedSection.style.display = 'block';
            } else {
                recentlyViewedSection.style.display = 'none';
            }
        } else {
            recentlyViewedSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching recently viewed entries:', error);
        recentlyViewedSection.style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayEntries();
    displayRecentlyViewedEntries();
});