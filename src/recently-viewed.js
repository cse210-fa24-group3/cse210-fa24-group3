document.addEventListener('DOMContentLoaded', async () => {
    const recentlyViewedGrid = document.getElementById('recently-viewed-grid');

    async function loadRecentlyViewed() {
        try {
            const response = await fetch('http://localhost:3000/api/recently-viewed');
            if (!response.ok) {
                throw new Error('Failed to fetch recently viewed entries');
            }

            const entries = await response.json();

            if (entries.length === 0) {
                recentlyViewedGrid.innerHTML = '<div class="no-entries">No recently viewed entries</div>';
                return;
            }

            recentlyViewedGrid.innerHTML = entries.map(entry => `
                <div class="entry-tile recently-viewed" onclick="window.location.href='new-page/editor.html?id=${entry.id}'">
                    <h3 class="entry-title">${entry.title || 'Untitled'}</h3>
                    <p class="entry-preview">${entry.content?.substring(0, 150) || 'No content'}...</p>
                    <div class="entry-meta">
                        Viewed: ${new Date(entry.viewed_at).toLocaleString()}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recently viewed entries:', error);
            recentlyViewedGrid.innerHTML = '<div class="no-entries">Failed to load recently viewed entries</div>';
        }
    }

    loadRecentlyViewed();
});
