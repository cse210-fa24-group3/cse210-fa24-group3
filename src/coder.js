async function AI_document() {
    const userQuery = document.getElementById('markdown-editor').value;

    if (!userQuery.trim()) {
        alert("Please enter a query.");
        return;
    }

    const apiUrl = '/api/query';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userQuery }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error storing query:", errorText);
            alert("Failed to store query. Please try again.");
            return;
        }

        // alert("Query stored successfully. Fetching response...");
        fetchResponse();
    } catch (error) {
        console.error("Error storing query:", error);
        alert("An error occurred while storing the query.");
    }
}

async function fetchResponse() {
    const apiUrl = '/api/response';

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error fetching response:", errorText);
            // alert("Failed to fetch response. Please try again.");
            return;
        }

        const data = await response.json();
        console.log("AI Response:", data.response);

        // Display the AI response
        document.getElementById('preview-content').innerHTML = data.response;
    } catch (error) {
        console.error("Error fetching response:", error);
        alert("An error occurred while fetching the response.");
    }
}