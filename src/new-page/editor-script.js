// DOM Elements
const overlay = document.querySelector('.overlay');
const themeToggle = document.querySelector('.theme-toggle');
const lightModeIcon = document.querySelector('.light-mode');
const darkModeIcon = document.querySelector('.dark-mode');

/**
 * Toggles the website's theme between light and dark modes.
 * 
 * It then switches the theme to the opposite mode,
 * updates the `data-theme` attribute, toggles the visibility of the corresponding
 * theme icons, and saves the user's preference in `localStorage`.
 * 
 * @function toggleTheme
 */
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

/**
 * Event listener for the theme toggle button.
 * 
 * When the user clicks the theme toggle button, the `toggleTheme` function
 * is invoked to switch between light and dark modes.
 * 
 * @event click
 * @param {Event} event - The click event object.
 */
themeToggle.addEventListener('click', toggleTheme);

/**
 * Loads the user's saved theme preference from localStorage and applies it.
 * 
 * This function is typically called when the page loads to ensure that the
 * user's preferred theme is applied consistently across sessions.
 * 
 * @function loadSavedTheme
 */
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

// Call `loadSavedTheme` to initialize theme on page load
loadSavedTheme();