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