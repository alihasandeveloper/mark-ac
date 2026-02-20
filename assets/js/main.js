/**
 * Universal Animation & Interaction Library
 * Compatible with both WordPress and Next.js environments
 * 
 * Usage in WordPress:
 * - Link this file in your theme's functions.php or directly in templates
 * - Ensure GSAP and Swiper are loaded before this script
 * 
 * Usage in Next.js:
 * - Import in _app.js or specific pages
 * - Use the exported initialize function: initMarkAnimations()
 * - Call cleanup on route changes: cleanupMarkAnimations()
 */

(function (root, factory) {
    'use strict';
    // UMD pattern for universal module compatibility
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS (Next.js)
        module.exports = factory();
    } else {
        // Browser globals (WordPress)
        root.MarkAnimations = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return {
            initialize: function () { },
            cleanup: function () { }
        };
    }

    const BASE_API = 'https://mac-dev-api.boomdevs.net/api/v1';
    const ROOT_URL = 'https://mac-dev-api.boomdevs.net';
    const WP_BASE_URL = 'https://mark-ac.boomdevs.net';
    // ============================================
    // SCROLL ANIMATOR CLASS
    // ============================================
    class ScrollAnimator {
        constructor() {
            this.elements = null;
            this.parallaxElements = null;
            this.hoverFollowElements = null;
            this.observer = null;
            this.handleParallaxBound = null;
            this.isInitialized = false;
        }

        init() {
            if (this.isInitialized) return;

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            this.elements = document.querySelectorAll('.animate-on-scroll');
            this.parallaxElements = document.querySelectorAll('[class*="parallax-"]');
            this.hoverFollowElements = document.querySelectorAll('.hover-follow');

            // Intersection Observer for scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, observerOptions);

            // Observe all animation elements
            this.elements.forEach(el => this.observer.observe(el));

            // Parallax scroll effect
            if (this.parallaxElements.length > 0) {
                this.handleParallaxBound = this.handleParallax.bind(this);
                window.addEventListener('scroll', this.handleParallaxBound, { passive: true });
                this.handleParallax(); // Initial call
            }

            // Hover follow cursor effect
            this.initHoverFollow();

            this.isInitialized = true;
        }

        initHoverFollow() {
            this.hoverFollowElements.forEach(el => {
                const moveHandler = (e) => this.handleHoverFollow(e, el);
                const leaveHandler = () => this.resetHoverFollow(el);

                el.addEventListener('mousemove', moveHandler);
                el.addEventListener('mouseleave', leaveHandler);

                // Store handlers for cleanup
                el._moveHandler = moveHandler;
                el._leaveHandler = leaveHandler;
            });
        }

        handleHoverFollow(e, element) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const moveX = (x - centerX) / centerX * 100;
            const moveY = (y - centerY) / centerY * 100;

            element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.3)`;
        }

        resetHoverFollow(element) {
            element.style.transform = 'translate(50px, 50px) scale(1)';
        }

        handleParallax() {
            const scrolled = window.pageYOffset;

            this.parallaxElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const elementTop = rect.top + scrolled;
                const windowHeight = window.innerHeight;

                // Only apply parallax when element is in viewport
                if (rect.top < windowHeight && rect.bottom > 0) {
                    let speed = 0.5; // default

                    if (el.classList.contains('parallax-slow')) {
                        speed = 0.3;
                    } else if (el.classList.contains('parallax-medium')) {
                        speed = 0.5;
                    } else if (el.classList.contains('parallax-fast')) {
                        speed = 0.8;
                    }

                    const yPos = (scrolled - elementTop) * speed;
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }

            if (this.handleParallaxBound) {
                window.removeEventListener('scroll', this.handleParallaxBound);
            }

            if (this.hoverFollowElements) {
                this.hoverFollowElements.forEach(el => {
                    if (el._moveHandler) {
                        el.removeEventListener('mousemove', el._moveHandler);
                    }
                    if (el._leaveHandler) {
                        el.removeEventListener('mouseleave', el._leaveHandler);
                    }
                });
            }

            this.isInitialized = false;
        }
    }

    // ============================================
    // CURRICULUM FILTER CLASS
    // ============================================
    class CurriculumFilter {
        constructor() {
            this.wrapper = null;
            this.filterForm = null;
            this.searchForm = null;
            this.isInitialized = false;
            this.loading = false;

            // API Configuration
            this.courseTypes = {
                'stories': {
                    api: 'https://mac-dev-api.boomdevs.net/api/v1/courses/bible-stories/',
                    title: 'Bible Stories'
                },
                'handbooks': {
                    api: 'https://mac-dev-api.boomdevs.net/api/v1/courses/handbooks/',
                    title: 'Teachers Handbook'
                },
                'series': {
                    api: 'https://mac-dev-api.boomdevs.net/api/v1/courses/vbsify-series/',
                    title: 'Vbsify Series'
                }
            };

            // Cache for filter options
            this.allCollections = {};
            this.allCharacters = {};
            this.allTags = {};

            // Current filters state
            this.currentFilters = {
                search: '',
                collections: [],
                characters: [],
                tags: []
            };
        }

        init() {
            if (this.isInitialized) return;

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        async setup() {
            this.wrapper = document.querySelector('.mac-curriculum-wrapper');
            if (!this.wrapper) return;

            this.filterForm = document.getElementById('curriculum-filter-form');
            this.searchForm = document.querySelector('.curriculum-search-form');

            // Get initial filters from URL
            this.currentFilters = this.getFiltersFromURL();

            // Update URL without reload
            this.updateURL(this.currentFilters, true);

            // Bind event handlers
            this.bindFilterToggles();
            this.bindSearchForm();

            // Fetch and render data
            await this.loadAndRender(this.currentFilters);

            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.filters) {
                    this.currentFilters = e.state.filters;
                    this.updateCheckboxStates();
                    this.updateSearchInput();
                    this.loadAndRender(this.currentFilters);
                }
            });

            this.isInitialized = true;
        }

        getFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);

            return {
                search: params.get('search') || '',
                collections: params.get('collections')
                    ? params.get('collections').split(',').map(Number).filter(Boolean)
                    : [],
                characters: params.get('characters')
                    ? params.get('characters').split(',').map(Number).filter(Boolean)
                    : [],
                tags: params.get('tags')
                    ? params.get('tags').split(',').map(Number).filter(Boolean)
                    : []
            };
        }

        getCurrentFiltersFromUI() {
            const searchInput = document.getElementById('curriculum-search-input');
            const search = searchInput ? searchInput.value.trim() : '';

            const collections = Array.from(
                this.filterForm.querySelectorAll('input[name="collections[]"]:checked')
            ).map(cb => parseInt(cb.value));

            const characters = Array.from(
                this.filterForm.querySelectorAll('input[name="characters[]"]:checked')
            ).map(cb => parseInt(cb.value));

            const tags = Array.from(
                this.filterForm.querySelectorAll('input[name="tags[]"]:checked')
            ).map(cb => parseInt(cb.value));

            return { search, collections, characters, tags };
        }

        updateCheckboxStates() {
            // Update collection checkboxes
            this.filterForm.querySelectorAll('input[name="collections[]"]').forEach(cb => {
                cb.checked = this.currentFilters.collections.includes(parseInt(cb.value));
            });

            // Update character checkboxes
            this.filterForm.querySelectorAll('input[name="characters[]"]').forEach(cb => {
                cb.checked = this.currentFilters.characters.includes(parseInt(cb.value));
            });

            // Update tag checkboxes
            this.filterForm.querySelectorAll('input[name="tags[]"]').forEach(cb => {
                cb.checked = this.currentFilters.tags.includes(parseInt(cb.value));
            });
        }

        updateSearchInput() {
            const searchInput = document.getElementById('curriculum-search-input');
            if (searchInput) {
                searchInput.value = this.currentFilters.search;
            }
        }

        updateURL(filters, replace = false) {
            const params = new URLSearchParams();

            if (filters.search) {
                params.set('search', filters.search);
            }

            if (filters.collections && filters.collections.length > 0) {
                params.set('collections', filters.collections.join(','));
            }

            if (filters.characters && filters.characters.length > 0) {
                params.set('characters', filters.characters.join(','));
            }

            if (filters.tags && filters.tags.length > 0) {
                params.set('tags', filters.tags.join(','));
            }

            const newURL = params.toString()
                ? `${window.location.pathname}?${params.toString()}`
                : window.location.pathname;

            // Update browser history
            if (replace) {
                window.history.replaceState({ filters }, '', newURL);
            } else {
                window.history.pushState({ filters }, '', newURL);
            }
        }

        async loadAndRender(filters) {
            if (this.loading) return;

            this.loading = true;
            this.showLoading();

            try {
                // Fetch courses from all APIs
                const coursesData = await this.fetchAllCourses(filters);

                // Build filter options from fetched data (only on first load)
                if (Object.keys(this.allCollections).length === 0) {
                    this.buildFilterOptions(coursesData);
                }

                // Render courses
                this.renderCourses(coursesData, filters);

                // Render active filters
                this.renderActiveFilters(filters);

            } catch (error) {
                console.error('Error loading curriculum:', error);
                this.showError('Failed to load curriculum. Please try again.');
            } finally {
                this.loading = false;
                this.hideLoading();
            }
        }

        async fetchAllCourses(filters) {
            const promises = Object.entries(this.courseTypes).map(async ([typeKey, typeInfo]) => {
                const courses = await this.fetchCoursesFromAPI(typeInfo.api, filters);
                return {
                    type: typeKey,
                    title: typeInfo.title,
                    courses: courses
                };
            });

            return await Promise.all(promises);
        }

        async fetchCoursesFromAPI(apiUrl, filters = {}) {
            // Build query parameters
            const params = new URLSearchParams();

            if (filters.search) {
                params.set('search', filters.search);
            }

            if (filters.collections && filters.collections.length > 0) {
                params.set('collections', filters.collections.join(','));
            }

            if (filters.characters && filters.characters.length > 0) {
                params.set('characters', filters.characters.join(','));
            }

            if (filters.tags && filters.tags.length > 0) {
                params.set('tags', filters.tags.join(','));
            }

            const url = params.toString() ? `${apiUrl}?${params.toString()}` : apiUrl;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                const data = await response.json();
                return data.results || [];
            } catch (error) {
                console.error('Error fetching from API:', apiUrl, error);
                return [];
            }
        }

        buildFilterOptions(coursesData) {
            // Reset filter collections
            this.allCollections = {};
            this.allCharacters = {};
            this.allTags = {};

            // Collect all unique filter options
            coursesData.forEach(({ courses }) => {
                courses.forEach(course => {
                    // Collections
                    if (course.collections) {
                        course.collections.forEach(col => {
                            if (!this.allCollections[col.id]) {
                                this.allCollections[col.id] = col.title;
                            }
                        });
                    }

                    // Characters
                    if (course.characters) {
                        course.characters.forEach(char => {
                            if (!this.allCharacters[char.id]) {
                                this.allCharacters[char.id] = char.name;
                            }
                        });
                    }

                    // Tags
                    if (course.tags) {
                        course.tags.forEach(tag => {
                            if (!this.allTags[tag.id]) {
                                this.allTags[tag.id] = tag.title;
                            }
                        });
                    }
                });
            });

            // Sort alphabetically
            const sortedCollections = Object.entries(this.allCollections).sort((a, b) =>
                a[1].localeCompare(b[1])
            );
            const sortedCharacters = Object.entries(this.allCharacters).sort((a, b) =>
                a[1].localeCompare(b[1])
            );
            const sortedTags = Object.entries(this.allTags).sort((a, b) =>
                a[1].localeCompare(b[1])
            );

            // Render filter options
            this.renderFilterCheckboxes('collections-options', sortedCollections, this.currentFilters.collections);
            this.renderFilterCheckboxes('characters-options', sortedCharacters, this.currentFilters.characters);
            this.renderFilterCheckboxes('tags-options', sortedTags, this.currentFilters.tags);

            // Bind checkbox event listeners
            this.bindCheckboxes();
        }

        renderFilterCheckboxes(containerId, items, selectedIds) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const filterType = containerId.replace('-options', '');

            container.innerHTML = items.map(([id, label]) => {
                const isChecked = selectedIds.includes(parseInt(id));
                return `
                <label>
                    <input type="checkbox" 
                           name="${filterType}[]" 
                           value="${id}"
                           ${isChecked ? 'checked' : ''}
                    >
                    ${this.escapeHtml(label)}
                </label>
            `;
            }).join('');
        }

        renderCourses(coursesData, filters) {
            const grid = document.getElementById('curriculum-grid');
            if (!grid) return;

            // Apply client-side filtering for search
            const filteredData = this.applyClientFilters(coursesData, filters);

            // Build HTML
            let html = '';
            filteredData.forEach(({ type, title, courses }) => {
                if (courses.length === 0) return;

                html += this.buildCourseSectionHTML(type, title, courses);
            });

            // Show "no results" message if empty
            if (!html) {
                html = '<div class="no-results"><p>No curriculum items found.</p></div>';
            }

            grid.innerHTML = html;
        }

        applyClientFilters(coursesData, filters) {
            if (!filters.search) return coursesData;

            // Apply search filter on client side
            return coursesData.map(section => ({
                ...section,
                courses: section.courses.filter(course => {
                    const searchLower = filters.search.toLowerCase();
                    return (
                        course.title.toLowerCase().includes(searchLower) ||
                        (course.description && course.description.toLowerCase().includes(searchLower))
                    );
                })
            }));
        }

        buildCourseSectionHTML(typeKey, typeTitle, courses) {
            const count = courses.length;

            return `
            <div class="course-section">
                <div class="section-header">
                    <h6>${this.escapeHtml(typeTitle)} <span>${count}</span></h6>
<!--                    <a href="/all-course?course=${typeKey}"  onclick="event.preventDefault(); window.__navigateNext('/all-course?course=${typeKey}')" class="see-all">-->
                    <a href="/all-course?course=${typeKey}"  class="see-all">
                        See all
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z"
                                fill="#1C274C" />
                        </svg>
                    </a>
                </div>
                <div class="section-grid">
                    ${courses.map(course => this.buildCourseCardHTML(typeKey, course)).join('')}
                </div>
            </div>
        `;
        }

        buildCourseCardHTML(typeKey, course) {
            const imageUrl = course.image
                ? `${ROOT_URL}/${course.image.replace(/^\/+/, '')}`
                : 'https://placehold.co/305x229';
            const firstCollection = course.collections && course.collections[0];
            const firstCharacter = course.characters && course.characters[0];
            const displayTags = course.tags ? course.tags.slice(0, 3) : [];

            const courseUrl = `/products?scope=${typeKey}&id=${course.id}&selected=${encodeURIComponent(course.title)}`;

            return `
            <a href="${courseUrl}" class="curriculum-card-link">
                <div class="curriculum-card">
                    <div class="card-image">
                        <img src="${imageUrl}" alt="${this.escapeHtml(course.title)}">
                        ${firstCollection ? `<span class="card-badge">${this.escapeHtml(firstCollection.title)}</span>` : ''}
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${this.escapeHtml(course.title)}</h3>
                        <div class="card-tags">
                            ${displayTags.map(tag => `<span class="tag">${this.escapeHtml(tag.title)}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </a>
            `;
        }


        renderActiveFilters(filters) {
            const container = document.getElementById('active-filters');
            if (!container) return;

            const hasActiveFilters = filters.search ||
                filters.collections.length > 0 ||
                filters.characters.length > 0 ||
                filters.tags.length > 0;

            if (!hasActiveFilters) {
                container.style.display = 'none';
                container.innerHTML = '';
                return;
            }

            container.style.display = 'flex';

            let html = '';

            // Search filter
            if (filters.search) {
                html += `
                <span class="active-filter-tag" data-filter-type="search">
                    Search: "${this.escapeHtml(filters.search)}"
                    <a href="#" class="remove-filter" data-filter-type="search">×</a>
                </span>
            `;
            }

            // Collection filters
            filters.collections.forEach(id => {
                const label = this.allCollections[id];
                if (label) {
                    html += `
                    <span class="active-filter-tag" data-filter-type="collections" data-filter-id="${id}">
                        ${this.escapeHtml(label)}
                        <a href="#" class="remove-filter" data-filter-type="collections" data-filter-id="${id}">×</a>
                    </span>
                `;
                }
            });

            // Character filters
            filters.characters.forEach(id => {
                const label = this.allCharacters[id];
                if (label) {
                    html += `
                    <span class="active-filter-tag" data-filter-type="characters" data-filter-id="${id}">
                        ${this.escapeHtml(label)}
                        <a href="#" class="remove-filter" data-filter-type="characters" data-filter-id="${id}">×</a>
                    </span>
                `;
                }
            });

            // Tag filters
            filters.tags.forEach(id => {
                const label = this.allTags[id];
                if (label) {
                    html += `
                    <span class="active-filter-tag" data-filter-type="tags" data-filter-id="${id}">
                        ${this.escapeHtml(label)}
                        <a href="#" class="remove-filter" data-filter-type="tags" data-filter-id="${id}">×</a>
                    </span>
                `;
                }
            });

            // Clear all link
            html += `<a href="#" class="clear-all-filters">Clear All</a>`;

            container.innerHTML = html;

            // Bind remove filter events
            this.bindActiveFilterRemoval();
        }

        bindActiveFilterRemoval() {
            // Individual filter removal
            document.querySelectorAll('.remove-filter').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    const filterType = link.dataset.filterType;
                    const filterId = link.dataset.filterId;

                    if (filterType === 'search') {
                        this.currentFilters.search = '';
                        document.getElementById('curriculum-search-input').value = '';
                    } else if (filterId) {
                        const id = parseInt(filterId);
                        this.currentFilters[filterType] = this.currentFilters[filterType].filter(fid => fid !== id);
                    }

                    // Update URL and reload
                    this.updateURL(this.currentFilters);
                    this.updateCheckboxStates();
                    this.loadAndRender(this.currentFilters);
                });
            });

            // Clear all filters
            const clearAll = document.querySelector('.clear-all-filters');
            if (clearAll) {
                clearAll.addEventListener('click', (e) => {
                    e.preventDefault();

                    this.currentFilters = {
                        search: '',
                        collections: [],
                        characters: [],
                        tags: []
                    };

                    // Clear UI
                    document.getElementById('curriculum-search-input').value = '';
                    this.updateCheckboxStates();

                    // Update URL and reload
                    this.updateURL(this.currentFilters);
                    this.loadAndRender(this.currentFilters);
                });
            }
        }

        bindFilterToggles() {
            document.querySelectorAll('.filter-title').forEach(title => {
                const handler = () => {
                    if (title._clickHandler) {
                        title.removeEventListener('click', title._clickHandler);

                    }
                    title.classList.toggle('active');
                    const options = title.nextElementSibling;

                    if (options) {
                        options.style.display =
                            options.style.display === 'none' || !options.style.display
                                ? 'flex'
                                : 'none';
                    }
                };
                title.addEventListener('click', handler);
                title._clickHandler = handler;
            });
        }

        bindCheckboxes() {
            document
                .querySelectorAll('.filter-options input[type="checkbox"]')
                .forEach(input => {
                    const handler = () => this.handleFilterChange();
                    input.addEventListener('change', handler);
                    input._changeHandler = handler;
                });
        }

        bindSearchForm() {
            if (this.searchForm) {
                this.searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFilterChange();
                });
            }
        }

        handleFilterChange() {
            // Get current filters from UI
            this.currentFilters = this.getCurrentFiltersFromUI();

            // Update URL without reload
            this.updateURL(this.currentFilters);

            // Reload courses with new filters
            this.loadAndRender(this.currentFilters);
        }

        showLoading() {
            const loading = document.getElementById('curriculum-loading');
            if (loading) loading.style.display = 'block';

            const grid = document.getElementById('curriculum-grid');
            if (grid) grid.style.opacity = '0.5';
        }

        hideLoading() {
            const loading = document.getElementById('curriculum-loading');
            if (loading) loading.style.display = 'none';

            const grid = document.getElementById('curriculum-grid');
            if (grid) grid.style.opacity = '1';
        }

        showError(message) {
            const grid = document.getElementById('curriculum-grid');
            if (grid) {
                grid.innerHTML = `<div class="error-message"><p>${this.escapeHtml(message)}</p></div>`;
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        destroy() {
            // Remove event listeners
            document.querySelectorAll('.filter-title').forEach(title => {
                if (title._clickHandler) {
                    title.removeEventListener('click', title._clickHandler);
                }
            });

            document
                .querySelectorAll('.filter-options input[type="checkbox"]')
                .forEach(input => {
                    if (input._changeHandler) {
                        input.removeEventListener('change', input._changeHandler);
                    }
                });

            this.isInitialized = false;
        }
    }

    // Initialize when DOM is ready
    if (typeof window !== 'undefined') {
        const curriculumFilter = new CurriculumFilter();
        curriculumFilter.init();
    }

    // ============================================
    // ALL COURSES MANAGER CLASS
    // ============================================
    class AllCoursesManager {
        constructor() {
            this.wrapper = null;
            this.grid = null;
            this.loading = null;
            this.headerEl = null;
            this.paginationEl = null;
            this.paginationHandler = null;
            this.isInitialized = false;
            this.isLoading = false;

            // API Configuration (same as CurriculumFilter)
            this.courseTypes = {
                'stories': {
                    api: `${BASE_API}/courses/bible-stories/`,
                    title: 'Bible Stories'
                },
                'handbooks': {
                    api: `${BASE_API}/courses/handbooks/`,
                    title: 'Teachers Handbook'
                },
                'series': {
                    api: `${BASE_API}/courses/vbsify-series/`,
                    title: 'Vbsify Series'
                }
            };

            this.perPage = 12;
            this.init();
        }

        init() {
            // Reset initialization flag to allow re-init on page changes
            this.isInitialized = false;

            // Wait for DOM to be ready
            // if (document.readyState === 'loading') {
            //     document.addEventListener('DOMContentLoaded', () => this.setup());
            // } else {
            this.setup();
            // }
        }

        async setup() {
            this.destroy();

            this.wrapper = document.querySelector('.mac-all-courses-wrapper');
            if (!this.wrapper) return;

            this.grid = document.getElementById('all-courses-grid');
            this.loading = document.getElementById('all-course-loading');
            this.headerEl = document.querySelector('.all-courses-header');
            this.paginationEl = document.querySelector('.all-courses-pagination');

            // Get course type and page from URL
            const params = new URLSearchParams(window.location.search);
            const courseType = params.get('course') || '';
            const currentPage = parseInt(params.get('paged') || params.get('page') || '1') || 1;

            // Validate course type
            if (!courseType || !this.courseTypes[courseType]) {
                this.showError('Invalid course type.');
                this.hideLoading();
                return;
            }

            // Store current state
            this.currentCourseType = courseType;
            this.currentPage = currentPage;

            // Bind pagination (click delegation)
            this.bindPagination();

            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                const params = new URLSearchParams(window.location.search);
                const page = parseInt(params.get('paged') || params.get('page') || '1') || 1;
                this.loadPage(page, true);
            });

            // Initial load
            await this.loadPage(currentPage);

            this.isInitialized = true;
        }

        bindPagination() {
            this.paginationHandler = (e) => {
                const paginationLink = e.target.closest('.pagination-number, .pagination-btn');

                if (paginationLink && this.wrapper.contains(paginationLink)) {
                    e.preventDefault();
                    const page = parseInt(paginationLink.dataset.page);
                    if (page && !isNaN(page)) {
                        this.loadPage(page);
                    }
                }
            };

            document.addEventListener('click', this.paginationHandler);
        }

        async loadPage(page, skipHistory = false) {
            if (this.isLoading) return;
            if (!this.currentCourseType) return;

            this.isLoading = true;
            this.showLoading();

            try {
                const courseInfo = this.courseTypes[this.currentCourseType];
                const apiUrl = `${courseInfo.api}?page=${page}&per_page=${this.perPage}`;

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                const courses = data.results || [];
                const total = data.count || 0;

                // Update header
                this.renderHeader(courseInfo.title, courses.length, total);

                // Render courses grid
                this.renderCourses(courses);

                // Render pagination
                this.renderPagination(total, page);

                // Update URL
                if (!skipHistory) {
                    this.updateURL(page);
                }

                // Update current page
                this.currentPage = page;

                // Scroll to top of grid
                if (page !== 1 || skipHistory) {
                    this.scrollToGrid();
                }

            } catch (error) {
                console.error('Error loading courses:', error);
                this.showError('Failed to load courses. Please try again.');
            } finally {
                this.isLoading = false;
                this.hideLoading();
            }
        }

        renderHeader(title, count, total) {
            if (!this.headerEl) return;

            this.headerEl.innerHTML = `
                <h2>${this.escapeHtml(title)}</h2>
                <p class="course-count">Showing ${count} of ${total} courses</p>
            `;
        }

        renderCourses(courses) {
            if (!this.grid) return;

            if (courses.length === 0) {
                this.grid.innerHTML = '<div class="no-results"><p>No courses found.</p></div>';
                return;
            }

            const html = courses.map(course => this.buildCourseCardHTML(course)).join('');
            this.grid.innerHTML = html;
        }

        buildCourseCardHTML(course) {
            // Sanitize image URL to prevent potential issues
            const imageUrl = course.image
                ? `${ROOT_URL}/${course.image.replace(/^\/+/, '')}`
                : 'https://placehold.co/305x229?text=No+Image';

            const firstCollection = course.collections?.[0]; // Optional chaining
            const displayTags = course.tags?.slice(0, 3) || []; // Optional chaining + fallback
            const courseUrl = `/products?scope=${encodeURIComponent(this.currentCourseType)}&id=${encodeURIComponent(course.id)}&selected=${encodeURIComponent(course.title)}`;

            return `
                <a href="${courseUrl}" class="curriculum-card-link" aria-label="View ${this.escapeHtml(course.title, true)}">
                    <div class="curriculum-card">
                        <div class="card-image">
                            <img 
                                src="${this.escapeHtml(imageUrl)}" 
                                alt="${this.escapeHtml(course.title, true)}" 
                                loading="lazy"
                                onerror="this.src='https://placehold.co/305x229?text=Image+Error'"
                            >
                            ${firstCollection
                    ? `<span class="card-badge">${this.escapeHtml(firstCollection.title)}</span>`
                    : ''
                }
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">
                                ${this.escapeHtml(course.title)}
                            </h3>
                            ${displayTags.length > 0 ? `
                            <div class="card-tags" role="list">
                                ${displayTags
                        .map(tag => `<span class="tag" role="listitem">${this.escapeHtml(tag.title)}</span>`)
                        .join('')
                    }
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </a>
            `;
        }


        renderPagination(total, currentPage) {
            if (!this.paginationEl) return;

            const totalPages = Math.ceil(total / this.perPage);

            if (totalPages <= 1) {
                this.paginationEl.innerHTML = '';
                return;
            }

            let html = '<div class="pagination-wrapper">';

            // Previous button
            if (currentPage > 1) {
                html += `
                    <a href="#" class="pagination-btn prev-btn" data-page="${currentPage - 1}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Previous
                    </a>
                `;
            }

            // Page numbers
            html += '<div class="pagination-numbers">';
            const range = 2;
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
                    const activeClass = i === currentPage ? 'active' : '';
                    html += `<a href="#" class="pagination-number ${activeClass}" data-page="${i}">${i}</a>`;
                } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
                    html += '<span class="pagination-dots">...</span>';
                }
            }
            html += '</div>';

            // Next button
            if (currentPage < totalPages) {
                html += `
                    <a href="#" class="pagination-btn next-btn" data-page="${currentPage + 1}">
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                `;
            }

            html += '</div>';
            this.paginationEl.innerHTML = html;
        }

        updateURL(page) {
            const params = new URLSearchParams(window.location.search);
            params.set('paged', page);
            const newURL = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({ page }, '', newURL);
        }

        showLoading() {
            if (this.loading) {
                this.loading.style.display = 'block';
            }
            if (this.grid) {
                this.grid.style.opacity = '0.5';
                this.grid.style.pointerEvents = 'none';
            }
        }

        hideLoading() {
            if (this.loading) {
                this.loading.style.display = 'none';
            }
            if (this.grid) {
                this.grid.style.opacity = '1';
                this.grid.style.pointerEvents = 'auto';
            }
        }

        showError(message) {
            if (this.grid) {
                this.grid.innerHTML = `<div class="no-results"><p>${this.escapeHtml(message)}</p></div>`;
            }
            // Hide header if error
            if (this.headerEl) {
                this.headerEl.innerHTML = '';
            }
            // Hide pagination if error
            if (this.paginationEl) {
                this.paginationEl.innerHTML = '';
            }
        }

        scrollToGrid() {
            if (this.wrapper) {
                const offset = 100;
                const elementPosition = this.wrapper.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        destroy() {
            if (this.paginationHandler) {
                document.removeEventListener('click', this.paginationHandler);
            }
            this.isInitialized = false;
        }
    }

    // ============================================
    // GSAP ANIMATIONS (with safer initialization)
    // ============================================
    function initGsapAnimations() {
        // Check if GSAP is available
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded - skipping animations');
            return null;
        }

        const cleanup = [];

        try {
            // Register plugins if available
            if (typeof SplitText !== 'undefined') {
                gsap.registerPlugin(SplitText);
            }
            if (typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
            }

            // Title animation
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            document.querySelectorAll(".mark-animated-heading .fb-advanced-heading").forEach((el) => {
                if (typeof SplitText !== 'undefined') {
                    const split = new SplitText(el, { type: "words" });

                    tl.fromTo(
                        split.words,
                        { scaleY: 0 },
                        {
                            scaleY: 1.3,
                            duration: 0.4,
                            stagger: 0.1,
                            transformOrigin: "center bottom",
                        }
                    )
                        .to(
                            split.words,
                            {
                                scaleY: 1,
                                duration: 0.4,
                                stagger: 0.1,
                                transformOrigin: "center bottom",
                            },
                            "-=0.2"
                        );
                }
            });

            // Hero section image card
            const wrapper = document.querySelector(".mark-hero-card-wrapper");
            if (wrapper) {
                const cards = Array.from(wrapper.querySelectorAll(".mark-hero-card-wrapper .fb-advanced-image-main-wrapper"));

                // Hero image card animation
                gsap.fromTo(
                    ".mark-hero-card-wrapper .fb-advanced-image-main-wrapper",
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.65)",
                        stagger: 0.1,
                        delay: 0.5
                    }
                );

                // Testimonial animation
                gsap.fromTo(
                    ".mark-testimonial .single-testimonial",
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.65)",
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: ".mark-testimonial",
                            start: "top 75%",
                            toggleActions: "play none none none",
                            once: true
                        }
                    }
                );

                // Interactive card physics
                const CONFIG = {
                    mass: 2.2,
                    stiffness: 0.09,
                    damping: 0.75,
                    baseRadius: 350,
                    intensity: 0.8,
                    falloffPower: 1.4
                };

                let mouse = { x: 0, y: 0, vX: 0, vY: 0 };
                let lastMouse = { x: 0, y: 0 };
                let isTouching = false;

                const cardStates = cards.map((el) => {
                    const rect = el.getBoundingClientRect();
                    return {
                        el,
                        cx: rect.left + rect.width / 2,
                        cy: rect.top + rect.height / 2,
                        x: 0, y: 0,
                        vX: 0, vY: 0
                    };
                });

                const handleMove = (clientX, clientY) => {
                    const rawVX = clientX - lastMouse.x;
                    const rawVY = clientY - lastMouse.y;

                    mouse.vX += (rawVX - mouse.vX) * 0.25;
                    mouse.vY += (rawVY - mouse.vY) * 0.25;

                    mouse.x = clientX;
                    mouse.y = clientY;
                    lastMouse.x = clientX;
                    lastMouse.y = clientY;
                };

                const mouseMoveHandler = (e) => {
                    handleMove(e.clientX, e.clientY);
                };

                const touchMoveHandler = (e) => {
                    if (!isTouching) return;
                    e.preventDefault();
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                };

                const touchStartHandler = (e) => {
                    isTouching = true;
                    const touch = e.touches[0];
                    lastMouse.x = touch.clientX;
                    lastMouse.y = touch.clientY;
                    mouse.x = touch.clientX;
                    mouse.y = touch.clientY;
                };

                const touchEndHandler = () => {
                    isTouching = false;
                };

                window.addEventListener("mousemove", mouseMoveHandler);
                wrapper.addEventListener("touchmove", touchMoveHandler, { passive: false });
                wrapper.addEventListener("touchstart", touchStartHandler, { passive: false });
                wrapper.addEventListener("touchend", touchEndHandler);

                const tickerCallback = () => {
                    const mouseSpeed = Math.sqrt(mouse.vX ** 2 + mouse.vY ** 2);
                    const dynamicRadius = CONFIG.baseRadius + (mouseSpeed * 2);

                    cardStates.forEach((state) => {
                        const dx = mouse.x - state.cx;
                        const dy = mouse.y - state.cy;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        let influence = 0;
                        if (dist < dynamicRadius) {
                            influence = Math.pow(1 - dist / dynamicRadius, CONFIG.falloffPower);
                        }

                        const impulseX = mouse.vX * influence * CONFIG.intensity;
                        const impulseY = mouse.vY * influence * CONFIG.intensity;

                        state.vX += impulseX;
                        state.vY += impulseY;

                        const springX = -CONFIG.stiffness * state.x;
                        const springY = -CONFIG.stiffness * state.y;

                        state.vX += springX / CONFIG.mass;
                        state.vY += springY / CONFIG.mass;

                        state.vX *= CONFIG.damping;
                        state.vY *= CONFIG.damping;

                        state.x += state.vX;
                        state.y += state.vY;

                        gsap.set(state.el, {
                            x: state.x,
                            y: state.y,
                            force3D: true,
                            rotationZ: state.vX * 0.1,
                            overwrite: "auto"
                        });
                    });

                    mouse.vX *= 0.8;
                    mouse.vY *= 0.8;
                };

                gsap.ticker.add(tickerCallback);

                const updateCardCenters = () => {
                    cardStates.forEach((state) => {
                        const rect = state.el.getBoundingClientRect();
                        state.cx = rect.left + rect.width / 2;
                        state.cy = rect.top + rect.height / 2;
                    });
                };

                window.addEventListener("resize", updateCardCenters);

                // Store cleanup function
                cleanup.push(() => {
                    window.removeEventListener("mousemove", mouseMoveHandler);
                    wrapper.removeEventListener("touchmove", touchMoveHandler);
                    wrapper.removeEventListener("touchstart", touchStartHandler);
                    wrapper.removeEventListener("touchend", touchEndHandler);
                    window.removeEventListener("resize", updateCardCenters);
                    gsap.ticker.remove(tickerCallback);
                });
            }
        } catch (error) {
            console.error('Error initializing GSAP animations:', error);
        }

        // Return cleanup function
        return () => {
            cleanup.forEach(fn => fn());
        };
    }

    // ============================================
    // TEXT ROTATION ANIMATION
    // ============================================
    function initRotatingText() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded - skipping rotating text');
            return null;
        }

        const words = ['Wise', 'Bold', 'Rooted', 'Spirit-led'];
        const wrapper = document.querySelector('.mark-rotating-wrapper');
        const text = document.querySelector('.mark-rotating-text');

        if (!wrapper || !text) return null;

        let index = 0;

        // Set initial width
        gsap.set(wrapper, { width: text.offsetWidth });

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        tl.to(text, {
            opacity: 0,
            duration: 0.3,
            ease: 'power1.out',
            onComplete: () => {
                index = (index + 1) % words.length;
                text.textContent = words[index];

                gsap.to(wrapper, {
                    width: text.offsetWidth,
                    duration: 0.4,
                    ease: 'power1.inOut'
                });
            }
        })
            .to(text, {
                opacity: 1,
                duration: 0.3,
                ease: 'power1.in'
            });

        return () => {
            tl.kill();
        };
    }

    // ============================================
    // PRICING CAROUSEL
    // ============================================
    function initPricingCarousel() {
        if (typeof Swiper === 'undefined') {
            console.warn('Swiper not loaded - skipping pricing carousel');
            return null;
        }

        const carouselWrappers = document.querySelectorAll('.mac-pricing-carousel-wrapper');
        const cleanupFunctions = [];

        carouselWrappers.forEach(function (wrapper) {
            const tabs = wrapper.querySelectorAll('.mac-pricing-tab');
            const carouselContainers = wrapper.querySelectorAll('.mac-pricing-carousel-container');
            let swiperInstances = {};
            let currentPeriod = 'month';

            // Initialize Swiper for each period
            carouselContainers.forEach(function (container) {
                const period = container.dataset.pricingPeriod;
                const swiperEl = container.querySelector('.mac-pricing-swiper');

                if (swiperEl) {
                    swiperInstances[period] = new Swiper(swiperEl, {
                        slidesPerView: 1,
                        spaceBetween: 20,
                        navigation: {
                            nextEl: container.querySelector('.swiper-button-next'),
                            prevEl: container.querySelector('.swiper-button-prev'),
                        },
                        breakpoints: {
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                        },
                    });
                }
            });

            // Tab switching
            const tabHandlers = [];
            tabs.forEach(tab => {
                const handler = function () {
                    const newPeriod = this.dataset.period;

                    if (newPeriod === currentPeriod) return;

                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    carouselContainers.forEach(function (container) {
                        const period = container.dataset.pricingPeriod;

                        if (period === newPeriod) {
                            container.style.display = '';
                            if (swiperInstances[period]) {
                                swiperInstances[period].update();
                                swiperInstances[period].slideTo(0, 0);
                            }
                        } else {
                            container.style.display = 'none';
                        }
                    });

                    currentPeriod = newPeriod;
                };

                tab.addEventListener('click', handler);
                tabHandlers.push({ tab, handler });
            });

            // Cleanup function for this wrapper
            cleanupFunctions.push(() => {
                tabHandlers.forEach(({ tab, handler }) => {
                    tab.removeEventListener('click', handler);
                });
                Object.values(swiperInstances).forEach(swiper => {
                    if (swiper && swiper.destroy) {
                        swiper.destroy();
                    }
                });
            });
        });

        return () => {
            cleanupFunctions.forEach(fn => fn());
        };
    }

    // ============================================
    // CURRICULUM PRODUCT CLASS
    // ============================================
    class CurriculumProduct {
        constructor() {
            this.wrapper = null;
            this.productsGrid = null;
            this.subscriptionSection = null;
            this.loadingEl = null;
            this.isInitialized = false;
            this.courseId = '';
            this.courseScope = '';
        }

        init() {
            if (this.isInitialized) return;

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        async setup() {
            this.wrapper = document.querySelector('.wp-block-mac-child-curriculum-products');
            if (!this.wrapper) return;

            // Get URL parameters
            const params = new URLSearchParams(window.location.search);
            this.courseId = params.get('id') || '';
            this.courseScope = params.get('scope') || 'stories';

            // Get DOM elements
            this.productsGrid = this.wrapper.querySelector('.mac-products-grid');
            this.subscriptionSection = this.wrapper.querySelector('.mac-subscription-section');
            this.loadingEl = this.wrapper.querySelector('#mac-products-loading');

            // Update subheading
            this.updateSubheading(params.get('selected'));

            // Load products and subscriptions
            await this.loadData();

            // Scroll to block if needed
            if (params.get('id')) {
                setTimeout(() => {
                    this.wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            }

            this.isInitialized = true;
        }

        updateSubheading(selectedTitle) {
            const subheadingEl = this.wrapper.querySelector('.mac-subheading[data-subheading-template]');
            if (!subheadingEl) return;

            const template = subheadingEl.dataset.subheadingTemplate || "You've selected \"{title}\" to begin learning, please choose the individual product or subscription plan that best fits your goals.";
            const displayTitle = selectedTitle || this.courseScope.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const finalText = template.replace('{title}', `<span>${this.escapeHtml(displayTitle)}</span>`);
            subheadingEl.innerHTML = finalText;
        }

        async loadData() {
            if (!this.courseId) {
                this.hideLoading();
                return;
            }

            try {
                // Fetch products and subscriptions in parallel
                const [products, subscriptions] = await Promise.all([
                    this.fetchProducts(),
                    this.fetchSubscriptions()
                ]);

                // Render products
                if (products && products.length > 0) {
                    this.renderProducts(products);
                } else {
                    this.showNoProducts();
                }

                // Render subscriptions
                if (subscriptions && subscriptions.length > 0) {
                    this.renderSubscriptions(subscriptions);
                }

            } catch (error) {
                console.error('Error loading curriculum products:', error);
                this.showError('Failed to load products. Please try again.');
            } finally {
                this.hideLoading();
            }
        }

        async fetchProducts() {
            const params = new URLSearchParams({
                page: '1',
                page_size: '100'
            });

            if (this.courseScope === 'stories') {
                params.set('stories', this.courseId);
            } else if (this.courseScope === 'series') {
                params.set('series', this.courseId);
            } else if (this.courseScope === 'handbooks') {
                params.set('handbooks', this.courseId);
            }

            const url = `${BASE_API}/products/list/public/?${params.toString()}`;
            console.log('Fetching products from:', url);

            try {
                const response = await fetch(url);
                // console.log('Products API response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Products API error response:', errorText);
                    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Products data received:', data);
                return data.results || [];
            } catch (error) {
                console.error('Error fetching products:', error);
                console.error('Error details:', {
                    message: error.message,
                    courseId: this.courseId,
                    courseScope: this.courseScope,
                    url: url
                });
                throw error; // Re-throw to be caught by loadData
            }
        }

        async fetchSubscriptions() {
            const params = new URLSearchParams({
                page: '1',
                page_size: '100'
            });

            if (this.courseScope === 'stories') {
                params.set('stories', this.courseId);
            } else if (this.courseScope === 'series') {
                params.set('series', this.courseId);
            } else if (this.courseScope === 'handbooks') {
                params.set('handbooks', this.courseId);
            }

            const url = `${BASE_API}/billing/public/tiers/?${params.toString()}`;

            try {
                const response = await fetch(url);
                // console.log('Subscriptions API response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Subscriptions API error response:', errorText);
                    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                // console.log('Subscriptions data received:', data);
                return data.results || [];
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                console.error('Error details:', {
                    message: error.message,
                    courseId: this.courseId,
                    courseScope: this.courseScope,
                    url: url
                });
                throw error; // Re-throw to be caught by loadData
            }
        }

        renderProducts(products) {
            if (!this.productsGrid) return;

            const html = products.map(product => this.buildProductCardHTML(product)).join('');
            this.productsGrid.innerHTML = html;

            // Remove no-products message if it exists
            const noProductsEl = this.wrapper.querySelector('.mac-no-products');
            if (noProductsEl) {
                noProductsEl.remove();
            }
        }

        buildProductCardHTML(product) {
            const isSale = product.sale_price && product.sale_price !== product.base_price;
            const price = isSale ? product.sale_price : product.base_price;
            const oldPrice = isSale ? product.base_price : '';
            const img = product.image || 'https://placehold.co/340x220?text=No+Image';
            const firstColl = product.collections && product.collections[0];
            const badgeText = firstColl || '';
            const productUrl = product.slug
                ? `${WP_BASE_URL}/products/${product.slug}`
                : '#';
            const imgUrl = img.startsWith('http') ? img : `${ROOT_URL}/${img.replace(/^\/+/, '')}`;

            return `
                <a href="${this.escapeHtml(productUrl)}" class="mac-product-card-link">
                    <div class="mac-product-card">
                        <div class="card-image-wrapper">
                            <img src="${this.escapeHtml(imgUrl)}" 
                                 alt="${this.escapeHtml(product.title)}" loading="lazy">
                            ${badgeText ? `<span class="card-badge">${this.escapeHtml(badgeText)}</span>` : ''}
                        </div>
                        <div class="card-content">
                            <div class="product-price-row">
                                ${oldPrice ? `<span class="old-price">${this.escapeHtml(oldPrice)}</span>` : ''}
                                <span class="current-price">${this.escapeHtml(price)}</span>
                            </div>
                            <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                            ${this.renderProductTags(product.tags || product.features || [])}
                        </div>
                    </div>
                </a>
            `;
        }

        renderProductTags(tags) {
            if (!tags || tags.length === 0) return '';

            return `
                <div class="product-tags">
                    ${tags.map(tag => `<span class="product-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            `;
        }

        renderSubscriptions(subscriptions) {
            if (!this.subscriptionSection) return;

            const subscriptionGrid = this.subscriptionSection.querySelector('.mac-subscription-grid');
            if (!subscriptionGrid) return;

            if (!subscriptions || subscriptions.length === 0) {
                this.subscriptionSection.style.display = 'none';
                return;
            }

            const html = subscriptions.map(sub => this.buildSubscriptionCardHTML(sub)).join('');
            subscriptionGrid.innerHTML = html;

            // Show section
            this.subscriptionSection.style.display = 'block';
        }

        buildSubscriptionCardHTML(sub) {
            const tier = sub.subscription_tier;
            const periodLabel = sub.interval === 'month' ? 'month' : 'year';
            const features = tier.features || [];
            const imgUrl = tier.image
                ? (tier.image.startsWith('http') ? tier.image : `${ROOT_URL}/${tier.image.replace(/^\/+/, '')}`)
                : '';

            return `
                <div class="pricing-card" data-tier-id="${this.escapeHtml(sub.id)}">
                    <div class="pricing-card-image-wrapper">
                        ${imgUrl ? `
                            <img src="${this.escapeHtml(imgUrl)}" 
                                 alt="${this.escapeHtml(tier.title)}" 
                                 class="pricing-card-image">
                        ` : `
                            <div class="pricing-card-placeholder">
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                    <rect width="80" height="80" fill="#e0e0e0"/>
                                    <path d="M40 20L50 40H30L40 20Z" fill="#999"/>
                                    <circle cx="40" cy="55" r="8" fill="#999"/>
                                </svg>
                            </div>
                        `}
                    </div>
                    <div class="pricing-card-content">
                        <h3 class="pricing-card-title">${this.escapeHtml(tier.title)}</h3>
                        <div class="pricing-card-price">
                            ${parseFloat(sub.price) === 0.0 ? `
                                <span class="price-free">00.00</span>
                            ` : `
                                <h5>
                                    <span class="price-currency">${sub.currency === 'USD' ? '$' : this.escapeHtml(sub.currency)}</span>
                                    <span class="price-amount">${Math.floor(sub.price)}</span>
                                    <span class="price-interval">/${periodLabel}</span>
                                </h5>
                            `}
                        </div>
                        ${this.renderSubscriptionFeatures(features)}
                        <a href="/checkout?subscription=${this.escapeHtml(sub.id)}" 
                           class="pricing-card-button" 
                           data-tier-slug="${this.escapeHtml(tier.slug)}">
                            Subscribe Now
                        </a>
                    </div>
                </div>
            `;
        }

        renderSubscriptionFeatures(features) {
            if (!features || features.length === 0) return '';

            return `
                <ul class="pricing-card-features">
                    ${features.map(feature => `<li>${this.escapeHtml(feature)}</li>`).join('')}
                </ul>
            `;
        }

        showNoProducts() {
            // Clear the products grid
            if (this.productsGrid) {
                this.productsGrid.innerHTML = '';
            }

            // Check if no-products message already exists
            let noProductsEl = this.wrapper.querySelector('.mac-no-products');
            if (!noProductsEl) {
                // Create and insert the no-products message after the products grid
                noProductsEl = document.createElement('div');
                noProductsEl.className = 'mac-no-products';
                noProductsEl.innerHTML = '<p>No products available for this course at the moment.</p>';
                this.productsGrid.parentNode.insertBefore(noProductsEl, this.productsGrid.nextSibling);
            }
        }

        showError(message) {
            if (this.productsGrid) {
                this.productsGrid.innerHTML = `
                    <div class="mac-error">
                        <p>${this.escapeHtml(message)}</p>
                    </div>
                `;
            }
        }

        hideLoading() {
            if (this.loadingEl) {
                this.loadingEl.style.display = 'none';
            }
        }

        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        destroy() {
            this.isInitialized = false;
        }
    }

    // Initialize when DOM is ready
    if (typeof window !== 'undefined') {
        const curriculumProduct = new CurriculumProduct();
        curriculumProduct.init();
    }

    // ============================================
    // CURRICULUM PRODUCTS (Legacy support)
    // ============================================
    function initCurriculumProducts() {
        const cleanupFunctions = [];

        // Populate mac-subheading from URL params
        const subheadingEl = document.querySelector('.mac-subheading[data-subheading-template]');
        if (subheadingEl) {
            const params = new URLSearchParams(window.location.search);
            const selectedTitle = params.get('selected') || '';
            const courseScope = subheadingEl.dataset.courseScope || 'stories';

            // Use selected param or fallback to formatted course scope
            const displayTitle = selectedTitle || courseScope.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            const template = subheadingEl.dataset.subheadingTemplate || "You've selected \"{title}\" to begin learning, please choose the individual product or subscription plan that best fits your goals.";

            // Replace {title} with the actual title wrapped in a span
            const finalText = template.replace('{title}', `<span>${escapeHtml(displayTitle)}</span>`);
            subheadingEl.innerHTML = finalText;
        }

        // Helper function to escape HTML
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Scroll to curriculum block if URL param exists
        if (location.search.includes('course=')) {
            const block = document.querySelector('.wp-block-mac-child-curriculum-products');
            if (block) {
                setTimeout(() => {
                    block.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            }
        }

        // Handle add to cart clicks
        const cartButtons = document.querySelectorAll('.mac-add-to-cart-btn');
        const handlers = [];

        cartButtons.forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                const id = btn.dataset.productId;
                alert(`You clicked product #${id}\n\n(Implement add-to-cart / redirect logic here)`);
            };
            btn.addEventListener('click', handler);
            handlers.push({ btn, handler });
        });

        cleanupFunctions.push(() => {
            handlers.forEach(({ btn, handler }) => {
                btn.removeEventListener('click', handler);
            });
        });

        return () => {
            cleanupFunctions.forEach(fn => fn());
        };
    }

    // ============================================
    // MAIN INITIALIZATION & CLEANUP
    // ============================================
    let instances = {
        scrollAnimator: null,
        curriculumFilter: null,
        allCoursesManager: null,
        gsapCleanup: null,
        rotatingTextCleanup: null,
        pricingCarouselCleanup: null,
        curriculumProductsCleanup: null
    };

    function initialize() {
        // Clean up any existing instances
        cleanup();

        // Wait for DOM to be ready
        const init = () => {
            // Initialize class instances
            instances.scrollAnimator = new ScrollAnimator();
            instances.scrollAnimator.init();

            instances.curriculumFilter = new CurriculumFilter();
            instances.curriculumFilter.init();

            instances.allCoursesManager = new AllCoursesManager();
            instances.allCoursesManager.init();

            // Initialize GSAP animations (returns cleanup function)
            instances.gsapCleanup = initGsapAnimations();

            // Initialize rotating text (returns cleanup function)
            instances.rotatingTextCleanup = initRotatingText();

            // Initialize pricing carousel (returns cleanup function)
            instances.pricingCarouselCleanup = initPricingCarousel();

            // Initialize curriculum products (returns cleanup function)
            instances.curriculumProductsCleanup = initCurriculumProducts();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    function cleanup() {
        // Destroy class instances
        if (instances.scrollAnimator?.destroy) {
            instances.scrollAnimator.destroy();
        }
        if (instances.curriculumFilter?.destroy) {
            instances.curriculumFilter.destroy();
        }
        if (instances.allCoursesManager?.destroy) {
            instances.allCoursesManager.destroy();
        }

        // Call cleanup functions
        if (instances.gsapCleanup) {
            instances.gsapCleanup();
        }
        if (instances.rotatingTextCleanup) {
            instances.rotatingTextCleanup();
        }
        if (instances.pricingCarouselCleanup) {
            instances.pricingCarouselCleanup();
        }
        if (instances.curriculumProductsCleanup) {
            instances.curriculumProductsCleanup();
        }

        // Reset instances
        instances = {
            scrollAnimator: null,
            curriculumFilter: null,
            allCoursesManager: null,
            gsapCleanup: null,
            rotatingTextCleanup: null,
            pricingCarouselCleanup: null,
            curriculumProductsCleanup: null
        };
    }

    // Auto-initialize in WordPress (browser global)
    if (typeof module === 'undefined' && typeof define === 'undefined') {
        initialize();

        // Handle browser navigation (back/forward)
        window.addEventListener('popstate', initialize);
    }

    // Return public API
    return {
        initialize,
        cleanup,
        instances
    };
}));