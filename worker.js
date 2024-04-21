let totalUploadedBytes = 0; // Define totalUploadedBytes globally

self.onmessage = async function(event) {
    
    const filenames = event.data.filenames;

    // Array to store promises for each file download
    const downloadPromises = [];
    const uploadedFiles = []; // Array to store uploaded files
    let totalDownloadedBytes = 0;

    // Start the timer for download test
    let downloadStartTime = performance.now();

    const downloadFile = async (filename) => {
        try {
            // Fetch the file and store it in cache
            const blob = await fetchAndCacheFile(filename);
            totalDownloadedBytes += blob.size;
            // Push the downloaded Blob into the array
            uploadedFiles.push(blob);
        } catch (error) {
            console.error(`Failed to download ${filename}:`, error);
        }
    };    

    // Function to fetch a file from the server and store it in cache
    const fetchAndCacheFile = async (filename) => {
        const url = `http://localhost:3000/server/${filename}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        return response.blob();
    };

    // Start downloading each file concurrently
    filenames.forEach(filename => {
        downloadPromises.push(downloadFile(filename));
    });

    // Await download completion
    try {
        await Promise.all(downloadPromises);
        // Calculate download duration
        const downloadEndTime = performance.now();
        const downloadDuration = downloadEndTime - downloadStartTime;

        // Calculate download speed
        const downloadSpeed = calculateSpeed(totalDownloadedBytes, downloadDuration);
        console.log(`Download Speed: ${downloadSpeed}`);

        // Reset timer for upload test
        let uploadStartTime = performance.now();

        // Function to handle uploading files
        const uploadFiles = async () => {
            const uploadPromises = [];
            uploadedFiles.forEach(blob => {
                uploadPromises.push(uploadFile(blob));
            });

            // Await upload completion
            await Promise.all(uploadPromises);

            // Calculate upload duration
            const uploadEndTime = performance.now();
            const uploadDuration = uploadEndTime - uploadStartTime;

            // Calculate upload speed
            const uploadSpeed = calculateSpeed(totalUploadedBytes, uploadDuration);
            console.log(`Upload Speed: ${uploadSpeed}`);

            // Send the overall speeds to the main thread
            self.postMessage({ downloadSpeed, uploadSpeed });
        };

        // Start uploading files
        uploadFiles();
    } catch (error) {
        console.error('Download failed:', error);
    }
};


// Function to upload a file to the server
const uploadFile = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    // Update the total uploaded bytes
    totalUploadedBytes += blob.size;
};


// Function to calculate speed
function calculateSpeed(bytes, duration) {
    console.log(duration);
    const speedBps = (bytes*8) / (duration / 1000); // Calculate speed in bytes per second
    return formatSpeed(speedBps);
}

// Function to format speed
function formatSpeed(speedBps) {
    if (speedBps >= 1000000) {
        return (speedBps / 1000000).toFixed(2) + ' Mbps';
    } else if (speedBps >= 1000) {
        return (speedBps / 1000).toFixed(2) + ' kbps';
    } else {
        return speedBps.toFixed(2) + ' bps';
    }
}