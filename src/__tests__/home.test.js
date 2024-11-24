/**
 * @jest-environment jsdom
 */

describe('Home Component Event Listeners', () => {
    let menuBtn;
    let sidebar;
    let overlay;

    beforeEach(() => {
        // Set up a simple HTML structure
        document.body.innerHTML = `
            <div class="navbar-left">
                <div class="menu-btn">Menu</div>
            </div>
            <div class="sidebar"></div>
            <div class="overlay"></div>
        `;

        // Query the DOM elements
        menuBtn = document.querySelector('.navbar-left div:first-child');
        sidebar = document.querySelector('.sidebar');
        overlay = document.querySelector('.overlay');

        // Add event listeners from your script
        menuBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);

        function toggleSidebar() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clean up the DOM
    });

    test('Sidebar toggles on menu button click', () => {
        // Assert initial state
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);

        // Simulate a click event on the menu button
        menuBtn.click();

        // Assert updated state
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
    });

    test('Sidebar toggles off when overlay is clicked', () => {
        // Simulate opening the sidebar first
        menuBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);

        overlay.click();

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });
});
