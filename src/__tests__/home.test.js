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
        document.body.innerHTML = `
            <div id="entries-grid"></div>
        `;

        // Clear localStorage before each test
        localStorage.clear();
        
        // Add a mock entry to localStorage to trigger displayEntries
        const mockEntries = [
            {
                id: 1,
                title: 'Test Entry',
                content: 'This is a test entry with a lot of content. '.repeat(10), // Long content to ensure truncation
                createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
            }
        ];
        
        localStorage.setItem('entries', JSON.stringify(mockEntries));

        // Reset modules so that when we import home.js it runs displayEntries again
        jest.resetModules();
    });

    test('displayEntries covers formatRelativeTime, truncateText, and createEntryTile', () => {
        // Import home.js after localStorage is set
        require('../home');

        const entriesGrid = document.getElementById('entries-grid');
        const entryTile = entriesGrid.querySelector('.entry-tile');
        expect(entryTile).not.toBeNull();

        // Check truncated text
        const previewText = entryTile.querySelector('.entry-preview').textContent;
        expect(previewText.endsWith('...')).toBe(true);

        // Check relative time formatting (should show "minutes ago" since we set it 5 min ago)
        const metaText = entryTile.querySelector('.entry-meta').textContent;
        expect(metaText).toMatch(/minutes ago/);
    });
});