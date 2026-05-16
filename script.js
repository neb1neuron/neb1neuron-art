const REPO_OWNER = 'neb1'; // Your GitHub username
const REPO_NAME = 'neb1neuron-art'; // Your repo name
// Auto-detect repository details from the URL
// If testing locally, replace these strings with your actual username and repo name
const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
const REPO_OWNER = window.location.hostname.includes('github.io') 
    ? window.location.hostname.split('.')[0] 
    : 'neb1'; 
const REPO_NAME = pathParts[0] || 'neb1neuron-art';
const IMAGES_PATH = 'images';

let images = [];
let currentIndex = 0;

const mainImage = document.getElementById('main-image');
const caption = document.getElementById('image-caption');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

async function fetchImages() {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGES_PATH}`);
        const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGES_PATH}`;
        console.log("Fetching gallery from:", apiUrl);

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("GitHub API Response:", data);
            throw new Error(`GitHub API returned ${response.status}: ${data.message}`);
        }

        if (!Array.isArray(data)) {
            throw new Error("Unexpected response format from GitHub API.");
        }

        // Filter for images and sort descending (z to a) to show latest first
        images = data
            .filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file.name))
            .sort((a, b) => b.name.localeCompare(a.name));

        if (images.length > 0) {
            displayImage(0);
        } else {
            caption.textContent = "No paintings found in /images folder.";
        }
    } catch (error) {
        console.error("Error fetching images:", error);
        caption.textContent = "Error loading gallery.";
    }
}

function displayImage(index) {
    currentIndex = index;
    const image = images[index];
    
    // Fade out effect
    mainImage.style.opacity = 0;
    
    setTimeout(() => {
        mainImage.src = image.download_url;
        // Clean up filename for caption (remove extension and replace dashes with spaces)
        const displayName = image.name.split('.')[0].replace(/[-_]/g, ' ');
        caption.textContent = displayName;
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
        mainImage.style.opacity = 1;
    }, 300);
}

function showNext() {
    if (currentIndex < images.length - 1) {
        displayImage(currentIndex + 1);
    } else {
        displayImage(0); // Loop to start
    }
}

function showPrev() {
    if (currentIndex > 0) {
        displayImage(currentIndex - 1);
    } else {
        displayImage(images.length - 1); // Loop to end
    }
}

nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
});

// Initialize
fetchImages();