// GitHub contribution graph JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

async function fetchGithubData() {
    try {
        const username = localStorage.getItem('github-username');
        if (!username) {
            throw new Error('No GitHub username found');
        }

        // Fetch events for the last year
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
    const yearAgo = new Date(today);
    yearAgo.setDate(today.getDate() - 364); // Set to 364 to include today
    
    const months = [];
    let currentDate = new Date(yearAgo);
    
    // Collect all month names first
    while (currentDate <= today) {
        const monthName = currentDate.toLocaleString('default', { month: 'short' });
        if (!months.includes(monthName)) {
            months.push(monthName);
        }
        currentDate.setDate(currentDate.getDate() + 7); // Jump week by week
    }
    
    // If December is at the start, move it to the end
    if (months[0] === 'Dec') {
        months.push(months.shift());
    }
    
    // Create and append the month labels
    months.forEach(monthName => {
        const span = document.createElement('span');
        span.textContent = monthName;
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
        
        // Calculate exactly 365 days ago from today
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        const yearAgo = new Date(today);
        yearAgo.setDate(today.getDate() - 364); // Set to 364 to include today
        yearAgo.setHours(0, 0, 0, 0); // Start of that day
        
        // Adjust to start from Monday
        const dayOfWeek = yearAgo.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        yearAgo.setDate(yearAgo.getDate() - daysToSubtract);
        
        const contributionMap = await fetchGithubData();
        
        // Calculate number of weeks needed
        const totalDays = Math.ceil((today - yearAgo) / (1000 * 60 * 60 * 24));
        const numberOfWeeks = Math.ceil(totalDays / 7);
        
        for (let week = 0; week < numberOfWeeks; week++) {
            const weekContainer = document.createElement('div');
            weekContainer.classList.add('week');
            
            for (let day = 0; day < 7; day++) {
                const square = document.createElement('div');
                square.classList.add('square');
                
                const currentDate = new Date(yearAgo);
                currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                
                // Only add active squares for dates within our 365-day range and not in the future
                if (currentDate <= today && currentDate >= yearAgo) {
                    const dateString = currentDate.toISOString().split('T')[0];
                    const count = contributionMap.get(dateString) || 0;
                    const level = getContributionLevel(count);
                    square.setAttribute('data-level', level);
                    square.title = `${currentDate.toDateString()}: ${count} contributions`;
                } else {
                    square.classList.add('inactive');
                }
                
                weekContainer.appendChild(square);
            }
            
            squares.appendChild(weekContainer);
        }
    } catch (error) {
        console.error('Error generating contribution data:', error);
        if (errorElement) errorElement.style.display = 'block';
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function initializeDashboard() {
    const username = localStorage.getItem('github-username');
    if (username) {
        updateMonthLabels();
        generateContributionData();
    }
}