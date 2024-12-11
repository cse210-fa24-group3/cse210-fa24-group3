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

/**
 * Toggles the visibility of the sidebar and overlay elements.
 * @function toggleSidebar
 */
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

/**
 * Handles the click event for the dark mode toggle button.
 * Toggles dark mode on document body, toggle button icon.
 * Saves the theme preference in localStorage.
 * @event click
 * @param {Event} event - The click event object.
 */
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.querySelector('.light-mode').style.display = document.body.classList.contains('dark-mode') ? 'none' : 'block';
    darkModeToggle.querySelector('.dark-mode').style.display = document.body.classList.contains('dark-mode') ? 'block' : 'none';
    
    // Save preference
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

/**
 * Handles the click event for the user menu button.
 * Toggles the visibility of the user menu.
 * @event click
 * @param {Event} e - The click event object.
 */
userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('active');
});

/**
 * Handles click events on the document to close the user menu
 * if the click is outside of the user menu.
 * @event click
 * @param {Event} e - The click event object.
 */
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

/**
 * Initializes the application when the DOM content is fully loaded.
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        darkModeToggle.querySelector('.light-mode').style.display = savedTheme === 'dark' ? 'none' : 'block';
        darkModeToggle.querySelector('.dark-mode').style.display = savedTheme === 'dark' ? 'block' : 'none';
    }
});