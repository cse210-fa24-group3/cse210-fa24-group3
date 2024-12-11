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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        darkModeToggle.querySelector('.light-mode').style.display = savedTheme === 'dark' ? 'none' : 'block';
        darkModeToggle.querySelector('.dark-mode').style.display = savedTheme === 'dark' ? 'block' : 'none';
    }
});

// Function to fetch GitHub contribution data
async function fetchGithubData(username) {
    try {
        // Fetch the user's events (includes commits)
        const response = await fetch(`https://api.github.com/users/${username}/events`);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const events = await response.json();
        
        // Create a map of dates to contribution counts
        const contributionMap = new Map();
        
        // Process only push events (commits)
        events.forEach(event => {
            if (event.type === 'PushEvent') {
                const date = event.created_at.split('T')[0];
                const currentCount = contributionMap.get(date) || 0;
                contributionMap.set(date, currentCount + event.payload.size);
            }
        });
        
        return contributionMap;
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return new Map();
    }
}

// Function to determine contribution level (0-4) based on count
function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

// Generate the contribution squares with real data
async function generateContributionData(username) {
    const squares = document.querySelector('#squares');
    squares.innerHTML = ''; // Clear existing squares
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Fetch real contribution data
    const contributionMap = await fetchGithubData(username);
    
    // Generate 52 weeks x 7 days of squares
    for (let i = 0; i < 52 * 7; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        
        const date = new Date(oneYearAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        // Get actual contribution count for this date
        const count = contributionMap.get(dateString) || 0;
        const level = getContributionLevel(count);
        
        square.setAttribute('data-level', level);
        square.title = `${date.toDateString()}: ${count} contributions`;
        
        squares.appendChild(square);
    }
}

// Update the save GitHub credentials function
function saveGithubCredentials() {
    const username = document.getElementById('github-username').value;
    const sshKey = document.getElementById('github-ssh-key').value;
    
    if (username && sshKey) {
        // Save credentials (you might want to store these securely)
        localStorage.setItem('github_username', username);
        localStorage.setItem('github_ssh_key', sshKey);
        
        // Generate contribution graph with the user's data
        generateContributionData(username);
        
        // Close the modal
        closeModal();
    }
}

// Function to initialize the dashboard
function initializeDashboard() {
    const savedUsername = localStorage.getItem('github_username');
    if (savedUsername) {
        generateContributionData(savedUsername);
    }
}

// Initialize when page loads
window.addEventListener('load', initializeDashboard);