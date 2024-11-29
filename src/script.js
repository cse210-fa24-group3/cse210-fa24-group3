// // DOM Elements
// const menuIcon = document.querySelector('.menu-icon');
// const sidebar = document.querySelector('.sidebar');
// const overlay = document.querySelector('.overlay');
// const themeToggle = document.querySelector('.theme-toggle');
// const lightModeIcon = document.querySelector('.light-mode');
// const darkModeIcon = document.querySelector('.dark-mode');

// // Sidebar Toggle
// menuIcon.addEventListener('click', () => {
//     sidebar.classList.toggle('active');
//     overlay.classList.toggle('active');
// });

// overlay.addEventListener('click', () => {
//     sidebar.classList.remove('active');
//     overlay.classList.remove('active');
// });

// // Theme Toggle Function
// function toggleTheme() {
//     const html = document.documentElement;
//     const currentTheme = html.getAttribute('data-theme');
//     const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
//     html.setAttribute('data-theme', newTheme);
    
//     // Toggle icon visibility
//     if (newTheme === 'dark') {
//         lightModeIcon.style.display = 'none';
//         darkModeIcon.style.display = 'block';
//     } else {
//         lightModeIcon.style.display = 'block';
//         darkModeIcon.style.display = 'none';
//     }

//     // Save theme preference
//     localStorage.setItem('theme', newTheme);
// }

// // Theme Toggle Event Listener
// themeToggle.addEventListener('click', toggleTheme);

// // Load Saved Theme
// function loadSavedTheme() {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//         document.documentElement.setAttribute('data-theme', savedTheme);
//         if (savedTheme === 'dark') {
//             lightModeIcon.style.display = 'none';
//             darkModeIcon.style.display = 'block';
//         }
//     }
// }

// // Initialize theme on page load
// loadSavedTheme();

// Menu toggle
const menuBtn = document.querySelector('.navbar-left div:first-child');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');

menuBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Dark mode toggle
const darkModeToggle = document.querySelector('.navbar-right div:nth-child(2)');
const moon = '🌙';
const sun = '☀️';

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? sun : moon;
});

// User menu toggle
const userBtn = document.querySelector('.navbar-right div:last-child');
const userMenu = document.querySelector('.user-menu');

userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

async function createNewTodoFromTemplate() {
    try {
        console.log('Starting todo creation...');
        
        const response = await fetch('/api/documents/new-todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success && data.documentId) {
            console.log('Redirecting to todo with ID:', data.documentId);
            window.location.href = `/todo/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID');
        }
    } catch (error) {
        console.error('Error creating todo:', error);
    }
}

async function createNewBugReviewFromTemplate() {
    try {
        console.log('Starting bug review creation...');
        
        const response = await fetch('/api/documents/new-bug-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success && data.documentId) {
            console.log('Redirecting to todo with ID:', data.documentId);
            window.location.href = `/bug-review/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID');
        }
    } catch (error) {
        console.error('Error creating bug review:', error);
    }
}

// feature and meeting
async function createNewFeatureFromTemplate() {
    try {
        console.log('Starting Feature Specification creation...');
        
        const response = await fetch('/api/documents/new-feature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success && data.documentId) {
            console.log('Redirecting to todo with ID:', data.documentId);
            window.location.href = `/feature/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID');
        }
    } catch (error) {
        console.error('Error creating Feature:', error);
    }
}

async function createNewMeetingFromTemplate() {
    try {
        console.log('Starting Minutes of Meeting creation...');
        
        const response = await fetch('/api/documents/new-meeting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success && data.documentId) {
            console.log('Redirecting to todo with ID:', data.documentId);
            window.location.href = `/meeting/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID');
        }
    } catch (error) {
        console.error('Error creating Meeting:', error);
    }
}

document.querySelector('.create-card').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/journal';
});