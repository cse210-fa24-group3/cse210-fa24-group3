const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');

let autoSaveTimeout;
const autoSave = () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveContent(true);
    }, 2000);
};

const saveContent = async (isAutoSave = false) => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title && !content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');
    const timestamp = new Date().toISOString();

    const entry = {
        id: editingId || crypto.randomUUID(),
        title: title || 'Untitled',
        content,
        created_at: timestamp,
        updated_at: timestamp
    };

    try {
        const url = editingId 
            ? `http://localhost:3000/api/entries/${editingId}`
            : 'http://localhost:3000/api/entries';
        
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { 
            title: entry.title, 
            content: entry.content, 
            updated_at: entry.updated_at 
        } : entry;
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Failed to save entry');
        }

        if (!isAutoSave) {
            const message = document.createElement('div');
            message.textContent = 'Saved successfully!';
            message.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: var(--olive-green);
                color: white;
                padding: 1rem 2rem;
                border-radius: 4px;
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 2000);

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        const message = document.createElement('div');
        message.textContent = 'Failed to save entry';
        message.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #ff4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }
}

window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');
    
    if (editingId) {
        try {
            const response = await fetch(`http://localhost:3000/api/entries/${editingId}`);
            if (!response.ok) throw new Error('Entry not found');
            
            const entry = await response.json();
            
            // Add to recently viewed
            addToRecentlyViewed(editingId);
            
            // Populate the editor
            document.getElementById('title-input').value = entry.title;
            document.getElementById('content-input').value = entry.content;
            
        } catch (error) {
            console.error('Error loading entry:', error);
            const message = document.createElement('div');
            message.textContent = 'Failed to load entry';
            message.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #ff4444;
                color: white;
                padding: 1rem 2rem;
                border-radius: 4px;
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 2000);
        }
    }
});

function addToRecentlyViewed(entryId) {
    if (!entryId) return;
    
    try {
        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Remove if already exists
        recentlyViewed = recentlyViewed.filter(id => id !== entryId);
        
        // Add to the beginning
        recentlyViewed.unshift(entryId);
        
        // Keep only the last 3 entries
        recentlyViewed = recentlyViewed.slice(0, 3);
        
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
        console.error('Error updating recently viewed entries:', error);
    }
}

titleInput.addEventListener('input', autoSave);
contentInput.addEventListener('input', autoSave);
saveButton.addEventListener('click', () => saveContent(false));
