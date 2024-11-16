// DOM Elements
const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');
// const saveButton = document.querySelector('.save-button');

// Auto-save functionality
let autoSaveTimeout;
// const autoSave = () => {
//     clearTimeout(autoSaveTimeout);
//     autoSaveTimeout = setTimeout(() => {
//         saveContent(true); // true indicates this is an auto-save
//     }, 2000);
// };

const saveContent = (isAutoSave = false) => {
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
        createdAt: timestamp,
        updatedAt: timestamp
    };

    // Get existing entries
    const entries = JSON.parse(localStorage.getItem('entries') || '[]');
    
    if (editingId) {
        // Update existing entry
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            entry.createdAt = entries[index].createdAt;
            entries[index] = entry;
        }
    } else {
        // Add new entry
        entries.unshift(entry);
    }
    
    localStorage.setItem('entries', JSON.stringify(entries));

    if (!isAutoSave) {
        // Show success message and redirect
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
            window.location.href = 'index.html';
        }, 1000);
    }
};

// Load existing entry if editing
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');
    
    if (editingId) {
        const entries = JSON.parse(localStorage.getItem('entries') || '[]');
        const entry = entries.find(e => e.id === editingId);
        
        if (entry) {
            titleInput.value = entry.title;
            contentInput.value = entry.content;
        }
    } else {
        // Check for draft content
        const draftContent = localStorage.getItem('draftContent');
        if (draftContent) {
            const { title, content } = JSON.parse(draftContent);
            titleInput.value = title || '';
            contentInput.value = content || '';
            localStorage.removeItem('draftContent');
        }
    }
});