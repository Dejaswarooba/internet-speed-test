// Create a new web worker
const worker = new Worker('worker.js');

// Listen for messages from the worker
worker.onmessage = function(event) {
    const { downloadSpeed, uploadSpeed } = event.data;
    console.log('Download speed:', downloadSpeed);
    console.log('Upload speed:', uploadSpeed);
};

// Fetch filenames from the server
fetchFilenamesFromServer()
    
// Function to fetch filenames from the server
function fetchFilenamesFromServer() {
    const url = 'http://localhost:3000/files'; // Adjust URL as needed
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                
                throw new Error('Failed to fetch filenames');
            }
            console.log(response)
            return response.json();
        })
        .then(data => {
            console.log(data)
            return data.filenames})
        .then(filenames => {
            // Send filenames to the worker
            worker.postMessage({ filenames });
        })
        .catch(error => {
            console.error('Failed to fetch filenames from server:', error);
        });
}
