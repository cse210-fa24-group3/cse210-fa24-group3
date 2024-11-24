async function loadRecentEntries() {
    const container = document.getElementById('recently-edited-container');
    if (!container) {
        console.error('Recently edited container not found');
        return;
    }

    try {
        console.log('Fetching entries...');
        const response = await fetch('http://localhost:3000/api/entries');
        const entries = await response.json();
        console.log('Fetched entries:', entries);

        if (!entries || entries.length === 0) {
            container.innerHTML = '<div class="card">No recent entries</div>';
            return;
        }

        // Sort entries by updated_at date
        entries.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Take only the 4 most recent entries
        const recentEntries = entries.slice(0, 4);

        // Create HTML for each entry
        const entriesHTML = recentEntries.map(entry => `
            <div class="card">
                <a href="/new-page/editor.html?id=${entry.id}" class="entry-link">
                    <h3>${entry.title || 'Untitled'}</h3>
                    <p>${entry.content ? entry.content.substring(0, 100) + '...' : 'No content'}</p>
                    <div class="entry-meta">
                        Last edited: ${formatDate(entry.updated_at)}
                    </div>
                </a>
            </div>
        `).join('');

        container.innerHTML = entriesHTML;
    } catch (error) {
        console.error('Error loading entries:', error);
        container.innerHTML = '<div class="card">Error loading entries</div>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
}

// Load entries when the page loads
document.addEventListener('DOMContentLoaded', loadRecentEntries);