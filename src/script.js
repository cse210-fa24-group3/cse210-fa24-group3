// Replace <FLASK_SERVER_IP> with the actual Flask server's IP address or domain
const FLASK_BASE_URL = "http://104.155.190.17:8080"; 

// Fetch all documents
async function fetchAllDocuments() {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/api/documents`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error fetching documents: ${response.status}`);
        const documents = await response.json();
        console.log("Fetched documents:", documents);
        return documents;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Fetch a specific document by ID
async function fetchDocumentById(documentId) {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/api/documents/${documentId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error fetching document: ${response.status}`);
        const document = await response.json();
        console.log("Fetched document:", document);
        return document;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Create a new document
async function createDocument(title, content, templateType = "default") {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/api/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, template_type: templateType }),
        });
        if (!response.ok) throw new Error(`Error creating document: ${response.status}`);
        const result = await response.json();
        console.log("Document created:", result);
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Update an existing document
async function updateDocument(documentId, title, content) {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/api/documents/${documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content }),
        });
        if (!response.ok) throw new Error(`Error updating document: ${response.status}`);
        const result = await response.json();
        console.log("Document updated:", result);
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}
async function createNewFeatureFromTemplate() {
    try {
        console.log('Starting Feature Specification creation...');
        
        // Use FLASK_BASE_URL to construct the full URL for the API
        const response = await fetch(`${FLASK_BASE_URL}/api/documents/new-feature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        // Check if the response indicates success and contains a documentId
        if (data.success && data.documentId) {
            console.log('Redirecting to feature page with ID:', data.documentId);
            window.location.href = `/feature/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID from response');
        }
    } catch (error) {
        console.error('Error creating Feature:', error);
    }
}
async function createNewBugReviewFromTemplate() {
    try {
        console.log('Starting bug review creation...');

        // Use FLASK_BASE_URL for the full endpoint URL
        const response = await fetch(`${FLASK_BASE_URL}/api/documents/new-bug-review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        // Redirect if successful
        if (data.success && data.documentId) {
            console.log('Redirecting to bug review with ID:', data.documentId);
            window.location.href = `http://104.155.190.17:8080/bug-review/${data.documentId}`;
        } else {
            throw new Error('Failed to get document ID from response');
        }
    } catch (error) {
        console.error('Error creating bug review:', error);
    }
}
async function deleteDocument(documentId) {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error deleting document: ${response.status}`);
        const result = await response.json();
        console.log("Document deleted:", result);
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Example Usage
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Fetching all documents...");
    const documents = await fetchAllDocuments();
    console.log("All documents:", documents);

    // Create a new document
    console.log("Creating a new document...");
    const newDoc = await createDocument("Test Document", "This is a test document.");
    console.log("New document created:", newDoc);

    // Fetch the newly created document
    console.log("Fetching the newly created document...");
    const fetchedDoc = await fetchDocumentById(newDoc.documentId);
    console.log("Fetched document:", fetchedDoc);

    // Update the document
    console.log("Updating the document...");
    const updatedDoc = await updateDocument(newDoc.documentId, "Updated Title", "Updated content.");
    console.log("Document updated:", updatedDoc);

    // Delete the document
    console.log("Deleting the document...");
    const deleteResult = await deleteDocument(newDoc.documentId);
    console.log("Document deleted:", deleteResult);
});