describe('Home Component Event Listeners', () => {
    let menuBtn;
    let sidebar;
    let overlay;

    beforeEach(() => {
        // Set up a simple HTML structure before each test
        document.body.innerHTML = `
            <div class="navbar-left">
                <div class="menu-btn">Menu</div>
            </div>
            <div class="sidebar"></div>
            <div class="overlay"></div>
            <div class="theme-toggle">
                <div class="light-mode"></div>
                <div class="dark-mode"></div>
            </div>
            <div class="user-btn"></div>
            <div class="user-menu"></div>
            <button id="see-more-button"></button>
            <div id="recently-edited-container"></div>
        `;

        // Query DOM elements after setting up the structure
        menuBtn = document.querySelector('.navbar-left .menu-btn');
        sidebar = document.querySelector('.sidebar');
        overlay = document.querySelector('.overlay');

        // Import and run the home.js code only after DOM is set up
        require('../home'); // Import the code to run the event listeners

    });

    afterEach(() => {
        // Clean up the DOM after each test
        document.body.innerHTML = '';
    });

    test('Sidebar toggles on menu button click', () => {
        // Initial state: sidebar and overlay should not have the 'active' class
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);

        // Simulate a click event on the menu button
        menuBtn.click();

        // After click: sidebar and overlay should have the 'active' class
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
    });

    // test('Sidebar toggles off when overlay is clicked', () => {
    //     // First, simulate opening the sidebar by clicking the menu button
    //     menuBtn.click();
    //     expect(sidebar.classList.contains('active')).toBe(true);
    //     expect(overlay.classList.contains('active')).toBe(true);

    //     // Simulate a click on the overlay to close the sidebar
    //     overlay.click();

    //     // After click: sidebar and overlay should not have the 'active' class
    //     expect(sidebar.classList.contains('active')).toBe(false);
    //     expect(overlay.classList.contains('active')).toBe(false);
    // });
});
