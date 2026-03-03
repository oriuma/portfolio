document.addEventListener('DOMContentLoaded', () => {
    const seedInput = document.getElementById('seed-input');
    const generateBtn = document.getElementById('generate-btn');
    const previewSection = document.getElementById('preview-section');
    const avatarImg = document.getElementById('avatar-img');
    const downloadSvgBtn = document.getElementById('download-svg');
    const downloadPngBtn = document.getElementById('download-png');
    const randomizeBtn = document.getElementById('randomize-btn');
    const styleBtns = document.querySelectorAll('.style-btn');

    let currentStyle = 'avataaars';
    let currentSeed = '';
    let currentAvatarUrl = '';

    // Style selection
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
            
            // Regenerate if seed exists
            if (currentSeed) {
                generateAvatar(currentSeed);
            }
        });
    });

    // Generate avatar
    function generateAvatar(seed) {
        if (!seed || seed.trim() === '') {
            seed = 'default-' + Date.now();
        }
        
        currentSeed = seed;
        currentAvatarUrl = `https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${encodeURIComponent(seed)}`;
        
        avatarImg.src = currentAvatarUrl;
        previewSection.classList.add('show');
        
        // Smooth scroll to preview
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // Generate button click
    generateBtn.addEventListener('click', () => {
        const seed = seedInput.value.trim() || `random-${Date.now()}`;
        generateAvatar(seed);
    });

    // Enter key to generate
    seedInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    // Randomize button
    randomizeBtn.addEventListener('click', () => {
        const randomSeed = Math.random().toString(36).substring(2, 15);
        seedInput.value = randomSeed;
        generateAvatar(randomSeed);
    });

    // Download SVG
    downloadSvgBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(currentAvatarUrl);
            const svgBlob = await response.blob();
            const url = window.URL.createObjectURL(svgBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `avatar-${currentSeed}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    });

    // Download PNG
    downloadPngBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            canvas.width = 512;
            canvas.height = 512;
            ctx.drawImage(img, 0, 0, 512, 512);
            
            canvas.toBlob((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `avatar-${currentSeed}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        img.src = currentAvatarUrl;
    });

    // Generate initial avatar on page load
    const initialSeed = 'oriuma';
    seedInput.value = initialSeed;
    generateAvatar(initialSeed);
});