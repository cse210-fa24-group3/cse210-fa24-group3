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

// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        darkModeToggle.querySelector('.light-mode').style.display = savedTheme === 'dark' ? 'none' : 'block';
        darkModeToggle.querySelector('.dark-mode').style.display = savedTheme === 'dark' ? 'block' : 'none';
    }
});

// GitHub Dashboard Functions
async function fetchGithubData() {
    try {
        const username = localStorage.getItem('github-username');
        if (!username) {
            throw new Error('No GitHub username found');
        }

        const response = await fetch(`https://api.github.com/users/${username}/events/public`);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const events = await response.json();
        
        const contributionMap = new Map();
        
        events.forEach(event => {
            const date = event.created_at.split('T')[0];
            const currentCount = contributionMap.get(date) || 0;
            
            let contributionCount = 0;
            
            switch (event.type) {
                case 'PushEvent':
                    contributionCount = event.payload.commits ? event.payload.commits.length : 1;
                    break;
                case 'CreateEvent':
                case 'PullRequestEvent':
                case 'IssuesEvent':
                case 'IssueCommentEvent':
                    contributionCount = 1;
                    break;
                default:
                    contributionCount = 0;
            }
            
            if (contributionCount > 0) {
                contributionMap.set(date, currentCount + contributionCount);
            }
        });
        
        return contributionMap;
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return new Map();
    }
}

function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
}

function updateMonthLabels() {
    const monthsContainer = document.querySelector('.months');
    monthsContainer.innerHTML = '';
    
    const today = new Date();
    const months = [];
    
    // Get the last 3 months in reverse order
    for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        months.push(monthName); // Use push instead of unshift
    }
    
    // Add month labels
    months.reverse().forEach(month => {  // Reverse the array before creating elements
        const span = document.createElement('span');
        span.textContent = month;
        monthsContainer.appendChild(span);
    });
}

async function generateContributionData() {
    const squares = document.querySelector('#squares');
    if (!squares) return;
    
    squares.innerHTML = '';
    
    const loadingElement = document.getElementById('contribution-loading');
    const errorElement = document.getElementById('contribution-error');
    
    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
        
        // Calculate start date (90 days ago, adjusted to Monday)
        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        
        // Adjust to start from Monday
        const dayOfWeek = ninetyDaysAgo.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - daysToSubtract);
        
        const contributionMap = await fetchGithubData();
        
        // Calculate number of weeks needed to show 90 days
        const numberOfWeeks = Math.ceil(90 / 7); // This will give us 13 weeks
        
        // Generate squares for the actual number of weeks needed
        for (let week = 0; week < numberOfWeeks; week++) {
            for (let day = 0; day < 7; day++) {
                const square = document.createElement('div');
                square.classList.add('square');
                
                const date = new Date(ninetyDaysAgo);
                date.setDate(date.getDate() + (week * 7) + day);
                
                // Skip if the date is in the future
                if (date > today) continue;
                
                const dateString = date.toISOString().split('T')[0];
                const count = contributionMap.get(dateString) || 0;
                const level = getContributionLevel(count);
                
                square.setAttribute('data-level', level);
                
                const commitText = count === 0 ? 'No contributions' : 
                                 count === 1 ? '1 contribution' : 
                                 `${count} contributions`;
                square.title = `${date.toDateString()}: ${commitText}`;
                
                squares.appendChild(square);
            }
        }
    } catch (error) {
        console.error('Error generating contribution data:', error);
        if (errorElement) errorElement.style.display = 'block';
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}
function saveGithubCredentials() {
    const username = document.getElementById('github-username').value;
    const sshKey = document.getElementById('github-ssh-key').value;
    
    if (username && sshKey) {
        localStorage.setItem('github-username', username);
        localStorage.setItem('github-ssh-key', sshKey);
        generateContributionData();
        closeModal();
    }
}

function initializeDashboard() {
    const username = localStorage.getItem('github-username');
    if (username) {
        updateMonthLabels();
        generateContributionData();
    }
}

window.addEventListener('load', () => {
    initializeDashboard();
    setInterval(initializeDashboard, 30 * 60 * 1000);
});