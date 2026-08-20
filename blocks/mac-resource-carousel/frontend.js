(function () {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousels);
    } else {
        initCarousels();
    }

    function initCarousels() {
        const carouselWrappers = document.querySelectorAll('.mac-resource-carousel-wrapper');

        carouselWrappers.forEach(function (wrapper) {
            initCarousel(wrapper);
        });
    }

    function initCarousel(wrapper) {
        const CONFIG = {
            radius: 800,
            visibleItems: 5,
        };
        const prevBtn = wrapper.querySelector('.carousel-prev');
        const nextBtn = wrapper.querySelector('.carousel-next');


        // State
        let state = {
            isDragging: false,
            startX: 0,
            currentScroll: 0,
            lastX: 0,
            itemSpacing: 220,
            totalWidth: 0,
            targetScroll: 0,
            isSnapping: false,
        };

        // DOM Elements
        const track = wrapper.querySelector('.carousel-track');
        const items = Array.from(wrapper.querySelectorAll('.carousel-slide'));
        const itemCount = items.length;

        if (!track || itemCount === 0) return;

        // Navigate function
        function navigate(direction) {
            const currentIndex = Math.round(-state.currentScroll / state.itemSpacing);
            const targetIndex = currentIndex + direction;
            state.targetScroll = -targetIndex * state.itemSpacing;
            state.isSnapping = true;
        }

        // Click events for prev and next buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                navigate(-1); // Prev slide
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                navigate(1); // Next slide
            });
        }


        // Initialize
        function init() {
            items.forEach(function (item) {
                item.style.position = 'absolute';
                item.style.left = '50%';
                item.style.top = '50%';
            });

            handleResize();

            state.currentScroll = 0;
            state.targetScroll = 0;

            update();
            wrapper.style.visibility = 'visible';
            addEventListeners();

            window.addEventListener('resize', handleResize);
        }

        function handleResize() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            let cardWidth, cardHeight;

            if (width >= 1024) {
                cardWidth = Math.min(450, width * 0.35);
                cardHeight = height * 0.7;
                state.itemSpacing = cardWidth * 1.5;
                CONFIG.radius = 2800;
            } else {
                cardWidth = Math.max(width * 0.5);
                cardHeight = height * 0.6;
                state.itemSpacing = cardWidth * 1.3;
                CONFIG.radius = 1800;
            }

            document.documentElement.style.setProperty('--card-width', cardWidth + 'px');
            document.documentElement.style.setProperty('--card-height', cardHeight + 'px');

            state.totalWidth = itemCount * state.itemSpacing;
        }

        function snapToNearest() {
            const index = Math.round(-state.currentScroll / state.itemSpacing);
            state.targetScroll = -index * state.itemSpacing;
            state.isSnapping = true;
        }

        function update() {
            if (state.isSnapping) {
                const diff = state.targetScroll - state.currentScroll;
                if (Math.abs(diff) < 1) {
                    state.currentScroll = state.targetScroll;
                    state.isSnapping = false;
                } else {
                    state.currentScroll += diff * 0.1;
                }
            }

            items.forEach(function (item, index) {
                const itemBaseOffset = index * state.itemSpacing;

                let visualOffset = (itemBaseOffset + state.currentScroll) % state.totalWidth;

                if (visualOffset > state.totalWidth / 2) {
                    visualOffset -= state.totalWidth;
                } else if (visualOffset < -state.totalWidth / 2) {
                    visualOffset += state.totalWidth;
                }

                const angleRad = visualOffset / CONFIG.radius;
                const angleDeg = angleRad * (180 / Math.PI);

                const x = CONFIG.radius * Math.sin(angleRad);
                const y = CONFIG.radius * (1 - Math.cos(angleRad));
                const rotate = angleDeg;

                const distance = Math.abs(visualOffset);
                let centerProximity = 1 - (distance / (state.itemSpacing * 0.5));
                centerProximity = Math.max(0, Math.min(1, centerProximity));

                item.style.setProperty('--x', x + 'px');
                item.style.setProperty('--y', y + 'px');
                item.style.setProperty('--rotate', rotate + 'deg');
                item.style.zIndex = Math.round(100 - Math.abs(angleDeg));

                let opacity = 1;
                if (distance > state.itemSpacing * 1.5) {
                    opacity = 0;
                } else if (distance > state.itemSpacing * 0.8) {
                    opacity = 1 - ((distance - state.itemSpacing * 0.8) / (state.itemSpacing * 0.7));
                }
                item.style.opacity = Math.max(0, opacity);

                item.style.setProperty('--btn-opacity', centerProximity);

                const btn = item.querySelector('.slide-button');
                if (btn) {
                    btn.style.pointerEvents = centerProximity > 0.8 ? 'auto' : 'none';
                }
            });

            requestAnimationFrame(update);
        }

        function handleStart(e) {
            state.isDragging = true;
            state.isSnapping = false;
            state.startX = getX(e);
            state.lastX = state.startX;
            track.style.cursor = 'grabbing';
        }

        function handleMove(e) {
            if (!state.isDragging) return;
            e.preventDefault();

            const x = getX(e);
            const delta = x - state.lastX;
            state.lastX = x;

            state.currentScroll += delta;
        }

        function handleEnd() {
            state.isDragging = false;
            track.style.cursor = 'grab';
            snapToNearest();
        }

        function getX(e) {
            return e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        }

        function addEventListeners() {
            track.addEventListener('mousedown', handleStart);
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);

            track.addEventListener('touchstart', handleStart, { passive: false });
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);

            document.body.addEventListener('mouseleave', function () {
                if (state.isDragging) {
                    state.isDragging = false;
                    snapToNearest();
                }
            });
        }

        init();
    }
})();