// recently-viewed.js

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-content">
            <h3 class="card-title">${entry.title}</h3>
            <div class="card-meta">
                <span class="card-author">${entry.author}</span>
                <span class="card-date">${formatDate(entry.lastEdited)}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `/new-page/editor.html?id=${entry.id}`;
    });
    
    return card;
}

function displayRecentlyEdited() {
    const grid = document.getElementById('recently-edited-grid');
    const recentlyEdited = JSON.parse(localStorage.getItem('recentlyEdited') || '[]');
    
    if (recentlyEdited.length === 0) {
        grid.innerHTML = `
            <div class="no-entries">
                No recently edited entries.
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    recentlyEdited.forEach(entry => {
        grid.appendChild(createEntryCard(entry));
    });
}

// Initialize dark mode
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', storedTheme === 'dark');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayRecentlyEdited();
    initThemeToggle();
});