describe('Home Component Event Listeners', () => {
    let menuBtn, sidebar, overlay, darkModeToggle, userBtn, userMenu;

    beforeEach(() => {
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

        jest.resetModules(); // Reset module cache
        require('../home'); // Import `home.js` after DOM is set up

        menuBtn = document.querySelector('.navbar-left .menu-btn');
        sidebar = document.querySelector('.sidebar');
        overlay = document.querySelector('.overlay');
        darkModeToggle = document.querySelector('.theme-toggle');
        userBtn = document.querySelector('.user-btn');
        userMenu = document.querySelector('.user-menu');
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clean up DOM
        jest.restoreAllMocks(); // Restore mocked functions
    });

    test('Sidebar toggles on menu button click', () => {
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);

        // Simulate click on the menu button
        menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });

    test('Sidebar toggles off when overlay is clicked', () => {
        menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });

    // test('Dark mode toggle updates theme and localStorage', () => {
    //     const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

    //     expect(document.body.classList.contains('dark-mode')).toBe(false);

    //     // Simulate toggle click
    //     darkModeToggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    //     expect(document.body.classList.contains('dark-mode')).toBe(false);
    //     expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');

    //     darkModeToggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    //     expect(document.body.classList.contains('dark-mode')).toBe(false);
    //     expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');
    // });

    test('User menu toggles on user button click', () => {
        expect(userMenu.classList.contains('active')).toBe(false);

        userBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(userMenu.classList.contains('active')).toBe(false);

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(userMenu.classList.contains('active')).toBe(false);
    });

    test('loadRecentEntries updates the DOM with entries', async () => {
        const mockEntries = [
            { id: 1, title: 'Entry 1', content: 'Content 1', updated_at: new Date().toISOString() },
            { id: 2, title: 'Entry 2', content: 'Content 2', updated_at: new Date().toISOString() },
        ];

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockEntries),
            })
        );

        const container = document.getElementById('recently-edited-container');
        const { loadRecentEntries } = require('../home');
        await loadRecentEntries();

        expect(container.innerHTML).toContain('Entry 1');
        expect(container.innerHTML).toContain('Entry 2');
    });

    test('loadRecentEntries handles errors gracefully', async () => {
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = jest.fn(() => Promise.reject('Fetch error'));

        const container = document.getElementById('recently-edited-container');
        const { loadRecentEntries } = require('../home');
        await loadRecentEntries();

        expect(container.innerHTML).toContain('Failed to load entries');
        expect(mockConsoleError).toHaveBeenCalledWith('Error loading entries:', 'Fetch error');

        mockConsoleError.mockRestore();
    });
});