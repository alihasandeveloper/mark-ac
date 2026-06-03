document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.mac-carousel');
    
    carousels.forEach(function(carousel) {
        const slides = carousel.querySelectorAll('.mac-slide');
        let currentIndex = Math.floor(slides.length / 2);
        
        // Function to scroll to specific slide
        function scrollToSlide(index) {
            const slide = slides[index];
            const slideWidth = slide.offsetWidth;
            const gap = 20;
            const scrollPosition = (slideWidth + gap) * index - (carousel.offsetWidth / 2) + (slideWidth / 2);
            
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
        
        // Set middle item as active initially
        function updateActive(index) {
            slides.forEach(function(slide) {
                slide.classList.remove('active');
            });
            slides[index].classList.add('active');
            scrollToSlide(index);
        }
        
        // Initial setup
        setTimeout(function() {
            updateActive(currentIndex);
        }, 100);
        
        // Click to make active
        slides.forEach(function(slide, index) {
            slide.addEventListener('click', function() {
                currentIndex = index;
                updateActive(currentIndex);
            });
        });
        
        // Auto rotate every 3 seconds
        setInterval(function() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateActive(currentIndex);
        }, 3000);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateActive(currentIndex);
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % slides.length;
                updateActive(currentIndex);
            }
        });
        
        // Update active on scroll (optional - for smooth UX)
        let scrollTimeout;
        carousel.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const scrollCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
                let closestIndex = 0;
                let closestDistance = Infinity;
                
                slides.forEach(function(slide, index) {
                    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
                    const distance = Math.abs(scrollCenter - slideCenter);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });
                
                if (closestIndex !== currentIndex) {
                    currentIndex = closestIndex;
                    slides.forEach(function(slide) {
                        slide.classList.remove('active');
                    });
                    slides[currentIndex].classList.add('active');
                }
            }, 150);
        });
    });
});