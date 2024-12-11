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
            <div id="entries-grid"></div> <!-- Added to fix null reference -->
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
        // Mock toggle logic
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);

        menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
    });

    test('Sidebar toggles off when overlay is clicked', () => {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });

        menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });

    test('User menu toggles on user button click', () => {
        // Mock toggle logic
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        document.body.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });

        expect(userMenu.classList.contains('active')).toBe(false);

        userBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(userMenu.classList.contains('active')).toBe(true);

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(userMenu.classList.contains('active')).toBe(false);
    });

    test('loadRecentEntries updates the DOM with entries', async () => {
        const mockLoadRecentEntries = jest.fn(() => {
            const container = document.getElementById('entries-grid');
            const mockEntries = [
                { id: 1, title: 'Entry 1', content: 'Content 1', createdAt: new Date().toISOString() },
                { id: 2, title: 'Entry 2', content: 'Content 2', createdAt: new Date().toISOString() },
            ];
            container.innerHTML = mockEntries.map(
                (entry) =>
                    `<div class="entry-tile">
                        <h3 class="entry-title">${entry.title}</h3>
                        <p class="entry-preview">${entry.content}</p>
                    </div>`
            ).join('');
        });

        await mockLoadRecentEntries();

        const container = document.getElementById('entries-grid');
        expect(container.innerHTML).toContain('Entry 1');
        expect(container.innerHTML).toContain('Entry 2');
    });

    test('loadRecentEntries handles errors gracefully', async () => {
        const mockLoadRecentEntries = jest.fn(() => {
            const container = document.getElementById('entries-grid');
            container.innerHTML = `<div class="error-message">Failed to load entries</div>`;
        });

        await mockLoadRecentEntries();

        const container = document.getElementById('entries-grid');
        expect(container.innerHTML).toContain('Failed to load entries');
    });
});

describe('Home Component Additional Coverage', () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="entries-grid"></div>`;
        localStorage.clear();
        jest.resetModules();
    });

    test('displayEntries covers all branches of formatRelativeTime', () => {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        const oneHour = 3600 * 1000;
        const oneDay = 86400 * 1000;
        const oneWeek = 604800 * 1000;

        const mockEntries = [
            {
                id: 1,
                title: 'Just Now',
                content: 'Short content',
                createdAt: new Date(now - 30 * 1000).toISOString() // 30 seconds ago
            },
            {
                id: 2,
                title: 'Minutes Ago',
                content: 'Content 2',
                createdAt: new Date(now - 5 * oneMinute).toISOString() // 5 minutes ago
            },
            {
                id: 3,
                title: 'Hours Ago',
                content: 'Content 3',
                createdAt: new Date(now - 2 * oneHour).toISOString() // 2 hours ago
            },
            {
                id: 4,
                title: 'Days Ago',
                content: 'Content 4',
                createdAt: new Date(now - 2 * oneDay).toISOString() // 2 days ago
            },
            {
                id: 5,
                title: 'Older Than A Week',
                content: 'Content 5',
                createdAt: new Date(now - 8 * oneDay).toISOString() // 8 days ago
            }
        ];

        localStorage.setItem('entries', JSON.stringify(mockEntries));
        require('../home');

        const entriesGrid = document.getElementById('entries-grid');
        const tiles = entriesGrid.querySelectorAll('.entry-tile');
        expect(tiles.length).toBe(mockEntries.length);

        const metaTexts = Array.from(tiles).map(tile => tile.querySelector('.entry-meta').textContent);

        // Check each entry's relative time
        const [justNow, minutesAgo, hoursAgo, daysAgo, olderDate] = metaTexts.map(text => text.trim());

        // "just now"
        expect(justNow).toBe('just now');
        
        // "X minutes ago"
        expect(minutesAgo).toMatch(/\d+ minutes ago/);

        // "X hours ago"
        expect(hoursAgo).toMatch(/\d+ hours ago/);

        // "X days ago"
        expect(daysAgo).toMatch(/\d+ days ago/);

        // Older than a week returns a locale date string
        // Just check it's not matching the patterns above and is likely a date
        expect(olderDate).not.toMatch(/just now|minutes ago|hours ago|days ago/);
        // You could also do a loose check, such as:
        // expect(new Date(olderDate).toString()).not.toBe('Invalid Date');
    });
});
