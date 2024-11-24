// DOM Elements
const menuBtn = document.querySelector('.navbar-left div:first-child');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const darkModeToggle = document.querySelector('.theme-toggle');
const userBtn = document.querySelector('.user-btn');
const userMenu = document.querySelector('.user-menu');

// Sidebar Toggle
menuBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.querySelector('.light-mode').style.display = document.body.classList.contains('dark-mode') ? 'none' : 'block';
    darkModeToggle.querySelector('.dark-mode').style.display = document.body.classList.contains('dark-mode') ? 'block' : 'none';
    
    // Save preference
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// User menu toggle
userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

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

// Create HTML for a single entry card
function createEntryCard(entry) {
    const truncatedContent = entry.content 
        ? entry.content.length > 100 
            ? entry.content.substring(0, 100) + '...'
            : entry.content
        : 'No content';

    return `
        <div class="card entry-card">
            <a href="new-page/editor.html?id=${entry.id}" class="entry-link">
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

async function loadRecentEntries() {
    const container = document.getElementById('recently-edited-container');
    const seeMoreButton = document.getElementById('see-more-button');
    
    if (!container) {
        console.error('Recently edited container not found');
        return;
    }

    const limit = showAllEntries ? null : 3; // Limit to 3 for initial load
    const url = limit ? `http://localhost:3000/api/entries?limit=${limit}` : `http://localhost:3000/api/entries`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const entries = await response.json();
        const seenIds = new Set(); // Track rendered entry IDs

        if (!entries || entries.length === 0) {
            container.innerHTML = '<div class="card no-entries">No entries yet. Create your first entry!</div>';
            return;
        }

        // Generate HTML for entries
        container.innerHTML = entries
            .filter(entry => !seenIds.has(entry.id)) // Filter out duplicate entries
            .map(entry => {
                seenIds.add(entry.id); // Track rendered entries
                return createEntryCard(entry);
            })
            .join('');

        // Show or hide the "See More" button
        if (entries.length >= 3 && !showAllEntries) {
            seeMoreButton.style.display = 'block';
        } else {
            seeMoreButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        container.innerHTML = '<div class="card error-card">Failed to load entries. Please try again later.</div>';
    }
}

// Toggle showAllEntries and reload
function toggleSeeMore() {
    showAllEntries = !showAllEntries;
    loadRecentEntries();
}

// Add event listener to "See More" button
document.getElementById('see-more-button').addEventListener('click', toggleSeeMore);

// Initialize on page load with debug logging
document.addEventListener('DOMContentLoaded', () => {
    loadRecentEntries();
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        darkModeToggle.querySelector('.light-mode').style.display = savedTheme === 'dark' ? 'none' : 'block';
        darkModeToggle.querySelector('.dark-mode').style.display = savedTheme === 'dark' ? 'block' : 'none';
    }
});
