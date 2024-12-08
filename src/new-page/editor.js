const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');
const saveButton = document.querySelector('.save-button');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');

// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Initialize theme
initializeTheme();
themeToggle.addEventListener('click', toggleTheme);

async function saveContent(isAutoSave = false) {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title && !content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');

    try {
        const url = editingId 
            ? `http://localhost:3000/api/documents/${editingId}`
            : 'http://localhost:3000/api/documents';

        const response = await fetch(url, {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title || 'Untitled',
                content
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save entry');
        }

        const data = await response.json();
        console.log(data);
        showNotification(isAutoSave ? 'Auto-saved!' : 'Saved successfully!', 'success');

        // Dispatch a custom event when document is saved
        window.dispatchEvent(new CustomEvent('document-saved', { 
            detail: { 
                id: data.documentId || editingId, 
                title, 
                content 
            } 
        }));

        if (!isAutoSave && !editingId) {
            // Only redirect if it's a manual save of a new document
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        showNotification(error.message || 'Failed to save entry', 'error');
    }
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

async function loadEntry() {
    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');

    if (!editingId) {
        titleInput.value = '';
        contentInput.value = '';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/documents/${editingId}`);
        if (!response.ok) {
            throw new Error(`Failed to load entry: ${response.status}`);
        }

        const entry = await response.json();
        
        titleInput.value = entry.title || '';
        contentInput.value = entry.content || '';
        
        document.title = `Editing: ${entry.title || 'Untitled'} | DevLog`;
        
    } catch (error) {
        console.error('Error loading entry:', error);
        showNotification('Failed to load entry', 'error');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Event Listeners
saveButton.addEventListener('click', () => saveContent(false));
window.addEventListener('load', loadEntry);

// Auto-save functionality
let autoSaveTimeout;
function setupAutoSave() {
    const AUTO_SAVE_DELAY = 3000; // 3 seconds

    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            saveContent(true);
        }, AUTO_SAVE_DELAY);
    }

    titleInput.addEventListener('input', triggerAutoSave);
    contentInput.addEventListener('input', triggerAutoSave);
}

// Get query parameters from URL
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

// Save or update a document
const saveDocument = async () => {
    const title = document.getElementById('document-title').value;
    const content = document.getElementById('document-content').value;
    const id = getQueryParam('id');
    
    if (!title) {
        alert('Title is required.');
        return;
    }

    try {
        if (id) {
            // Update existing document
            const response = await fetch(`/api/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                alert('Document updated successfully.');
                window.location.href = '/home.html';
            } else {
                alert('Failed to update document.');
            }
        } else {
            // Create new document
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                alert('Document created successfully.');
                window.location.href = '/home.html';
            } else {
                alert('Failed to create document.');
            }
        }
    } catch (error) {
        console.error('Error saving document:', error);
        alert('Failed to save document. Please try again later.');
    }
};

// Load document content into editor if editing
const loadDocument = async () => {
    const id = getQueryParam('id');
    if (!id) return;

    try {
        const response = await fetch(`/api/documents/${id}`);
        if (response.status === 404) {
            alert('Document not found.');
            window.location.href = '/home.html';
            return;
        }

        const document = await response.json();
        document.getElementById('document-title').value = document.title;
        document.getElementById('document-content').value = document.content;
    } catch (error) {
        console.error('Error loading document:', error);
        alert('Failed to load document. Please try again later.');
    }
};

// Initialize editor on page load
document.addEventListener('DOMContentLoaded', loadDocument);

// Attach event listener to save button
document.getElementById('save-button').addEventListener('click', saveDocument);
setupAutoSave();