// Before/After Image Comparison Slider
class ImageComparison {
    constructor(container) {
        this.container = container;
        this.slider = container.querySelector('.slider');
        this.afterWrapper = container.querySelector('.image-after-wrapper');
        this.isDragging = false;
        
        this.init();
    }

    init() {
        // Mouse events
        this.slider.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));

        // Touch events
        this.slider.addEventListener('touchstart', this.startDrag.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this));
        document.addEventListener('touchend', this.endDrag.bind(this));

        // Click on container to move slider
        this.container.addEventListener('click', this.clickMove.bind(this));
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.slider.classList.add('dragging');
        document.body.style.cursor = 'ew-resize';
    }

    drag(e) {
        if (!this.isDragging) return;

        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        this.updatePosition(x);
    }

    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.slider.classList.remove('dragging');
        document.body.style.cursor = '';
    }

    clickMove(e) {
        if (this.isDragging) return;
        if (e.target === this.slider || this.slider.contains(e.target)) return;

        const x = e.clientX;
        this.updatePosition(x);
    }

    updatePosition(clientX) {
        const rect = this.container.getBoundingClientRect();
        let x = clientX - rect.left;
        
        // Constrain to container bounds
        x = Math.max(0, Math.min(x, rect.width));
        
        const percentage = (x / rect.width) * 100;
        
        this.slider.style.left = percentage + '%';
        this.afterWrapper.style.width = (100 - percentage) + '%';
    }
}

// Initialize all comparison containers
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.comparison-container');
    containers.forEach(container => {
        new ImageComparison(container);
    });

    // Add fade-in animation
    const cards = document.querySelectorAll('.comparison-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 150);
    });
});