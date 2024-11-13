// DOM Elements
const menuIcon = document.querySelector('.menu-icon');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const themeToggle = document.querySelector('.theme-toggle');
const lightModeIcon = document.querySelector('.light-mode');
const darkModeIcon = document.querySelector('.dark-mode');

// Sidebar Toggle
menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Theme Toggle Function
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    
    // Toggle icon visibility
    if (newTheme === 'dark') {
        lightModeIcon.style.display = 'none';
        darkModeIcon.style.display = 'block';
    } else {
        lightModeIcon.style.display = 'block';
        darkModeIcon.style.display = 'none';
    }

    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Theme Toggle Event Listener
themeToggle.addEventListener('click', toggleTheme);

// Load Saved Theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            lightModeIcon.style.display = 'none';
            darkModeIcon.style.display = 'block';
        }
    }
}

// Initialize theme on page load
loadSavedTheme();