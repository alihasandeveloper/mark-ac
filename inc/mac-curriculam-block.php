<?php
/**
 * Register and render MAC Curriculum Block
 * Updated version: Minimal PHP, JS handles API and rendering
 */

// Register the block
function mac_register_curriculum_block()
{
    wp_register_style(
        'mac-curriculum-block-style',
        get_stylesheet_directory_uri() . '/blocks/mac-curriculam-block/style.css',
        array('swiper-css'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-curriculam-block/style.css')
    );

    // Register block script
    wp_register_script(
        'mac-curriculum-block-script',
        get_stylesheet_directory_uri() . '/blocks/mac-curriculam-block/block.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-curriculam-block/block.js')
    );

    // Register the block
    register_block_type('mac-theme/curriculum-block', array(
        'editor_script' => 'mac-curriculum-block-script',
        'style' => 'mac-curriculum-block-style',
        'render_callback' => 'mac_render_curriculum_block',
        'attributes' => array(
            'postsPerPage' => array(
                'type' => 'number',
                'default' => 9
            ),
            'layout' => array(
                'type' => 'string',
                'default' => 'grid'
            )
        )
    ));
}
add_action('init', 'mac_register_curriculum_block');

function mac_render_curriculum_block($attributes)
{
    $layout = isset($attributes['layout']) ? $attributes['layout'] : 'grid';
    $layout = in_array($layout, array('grid', 'slider'), true) ? $layout : 'grid';

    // Get current filters from URL for initial state
    $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
    $collections = isset($_GET['collections']) ? sanitize_text_field($_GET['collections']) : '';
    $characters = isset($_GET['characters']) ? sanitize_text_field($_GET['characters']) : '';
    $tags = isset($_GET['tags']) ? sanitize_text_field($_GET['tags']) : '';

    wp_enqueue_style('mac-curriculum-block-style');

    ob_start();
    ?>
    <div class="mac-curriculum-wrapper" data-layout="<?php echo esc_attr($layout); ?>"
        data-search="<?php echo esc_attr($search); ?>"
        data-collections="<?php echo esc_attr($collections); ?>" data-characters="<?php echo esc_attr($characters); ?>"
        data-tags="<?php echo esc_attr($tags); ?>">
        <div class="curriculum-header">
            <h2>Our Library</h2>
            <div class="curriculum-search">
                <form method="get" action="" class="curriculum-search-form">
                    <input type="text" id="curriculum-search-input" name="search" placeholder="Search library"
                        value="<?php echo esc_attr($search); ?>">
                    <button type="submit" id="curriculum-search-btn">Search</button>
                </form>
            </div>
        </div>
        <div class="curriculum-content">
            <aside class="curriculum-sidebar">
                <form method="get" action="" id="curriculum-filter-form">
                    <!-- Search parameter preservation -->
                    <?php if ($search): ?>
                        <input type="hidden" name="search" value="<?php echo esc_attr($search); ?>">
                    <?php endif; ?>

                    <!-- Collections Filter -->
                    <!-- <div class="filter-group">
                        <h4 class="filter-title active">
                            Collections
                            <span class="filter-toggle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <path d="M19 9L12 15L5 9" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </span>
                        </h4>
                        <div class="filter-options" id="collections-options" style="display: flex">
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 25%; margin-top: 6px; border-radius: 8px"></div>
                        </div>
                    </div> -->

                    <!-- Characters Filter -->
                    <div class="filter-group">
                        <h4 class="filter-title active">
                            Characters
                            <span class="filter-toggle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <path d="M19 9L12 15L5 9" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </span>
                        </h4>
                        <div class="filter-options" id="characters-options" style="display: flex">
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>
                            <div class="skeleton-link" style="width: 25%; margin-top: 6px; border-radius: 8px"></div>
                            <!-- Populated by JS -->
                        </div>
                    </div>

                    <!-- Tags Filter -->
                    <!--                    <div class="filter-group">-->
                    <!--                        <h4 class="filter-title active">-->
                    <!--                            Tags-->
                    <!--                            <span class="filter-toggle">-->
                    <!--                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"-->
                    <!--                                    fill="none">-->
                    <!--                                    <path d="M19 9L12 15L5 9" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"-->
                    <!--                                        stroke-linejoin="round" />-->
                    <!--                                </svg>-->
                    <!--                            </span>-->
                    <!--                        </h4>-->
                    <!--                        <div class="filter-options" id="tags-options" style="display: flex">-->
                    <!--                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>-->
                    <!--                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>-->
                    <!--                            <div class="skeleton-link" style="width: 100%; border-radius: 8px"></div>-->
                    <!--                            <-- Populated by JS -->
                    <!--                        </div>-->
                    <!--                    </div>-->
                </form>
            </aside>
            <div class="curriculum-main">
                <div class="active-filters" id="active-filters">
                    <!-- Populated by JS -->
                </div>
                <div class="curriculum-loading" id="curriculum-loading">
                    <div class="skeleton-wrapper">

                        <!-- Skeleton for course sections -->
                        <div class="skeleton-section">
                            <div class="skeleton-section-header">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-link"></div>
                            </div>
                            <div class="skeleton-grid">
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Second skeleton section for variety -->
                        <div class="skeleton-section">
                            <div class="skeleton-section-header">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-link"></div>
                            </div>
                            <div class="skeleton-grid">
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-content">
                                        <div class="skeleton-text skeleton-text-title"></div>
                                        <div class="skeleton-tags">
                                            <div class="skeleton-tag"></div>
                                            <div class="skeleton-tag"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="curriculum-grid" id="curriculum-grid">
                    <!-- Populated by JS -->

                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}