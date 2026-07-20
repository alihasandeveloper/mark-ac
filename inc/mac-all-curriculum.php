<?php
/**
 * Register and render MAC All Courses Block
 */

// Register the block
function mac_register_all_courses_block()
{
    // Register block script
    wp_register_script(
        'mac-all-courses-block-script',
        get_stylesheet_directory_uri() . '/blocks/mac-all-curriculum/block.js',
        array(),
        filemtime(get_stylesheet_directory() . '/blocks/mac-all-curriculum/block.js')
    );

    // Register the block
    register_block_type('mac-theme/all-courses-block', array(
        'editor_script' => 'mac-all-courses-block-script',
        'render_callback' => 'mac_render_all_courses_block'
    ));
}
add_action('init', 'mac_register_all_courses_block');

// Define course types and APIs
function mac_get_all_course_types()
{
    return [
        'stories' => [
            'api' => 'https://api.markandrewscreative.com/api/v1/courses/bible-stories/',
            'title' => 'Bible Stories',
        ],
        'vseries' => [
            'api' => 'https://api.markandrewscreative.com/api/v1/courses/vbsify-series/',
            'title' => 'Vbsify Stories',
        ],
        'handbooks' => [
            'api' => 'https://api.markandrewscreative.com/api/v1/courses/handbooks/',
            'title' => 'Bible Lab',
        ],
    ];
}

// Fetch courses from API with pagination
function mac_fetch_all_courses_from_api($api_url, $page = 1, $per_page = 12)
{
    // Add pagination parameters to API URL
    $url = add_query_arg(array(
        'page' => $page,
        'per_page' => $per_page
    ), $api_url);

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return array('courses' => [], 'total' => 0);
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    // Assuming API returns total count in 'count' or 'total' field
    $total = isset($data['count']) ? $data['count'] : (isset($data['total']) ? $data['total'] : 0);
    $courses = isset($data['results']) ? $data['results'] : [];

    return array(
        'courses' => $courses,
        'total' => $total
    );
}

// Render block on frontend - JavaScript will handle data fetching and rendering
function mac_render_all_courses_block($attributes)
{
    ob_start();
    ?>
    <div class="mac-all-courses-wrapper">
        <div class="all-course-loading" id="all-course-loading" style="display: block;">
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
            </div>
        </div>
        <div class="all-courses-header">
            <!-- Populated by JavaScript -->
        </div>

        <div class="all-courses-grid" id="all-courses-grid">
            <!-- Populated by JavaScript -->
        </div>

        <div class="all-courses-pagination">
            <!-- Populated by JavaScript -->
        </div>

    </div>
    <?php
    return ob_get_clean();
}

// Render courses grid
function mac_render_all_courses($courses, $type_key)
{
    if (empty($courses)) {
        return '<div class="no-results"><p>No courses found.</p></div>';
    }

    ob_start();
    foreach ($courses as $course):
        $image_url = !empty($course['image']) ? esc_url($course['image']) : 'https://placehold.co/305x229';
        ?>
        <div class="curriculum-card">
            <div class="card-image">
                <img src="<?php echo esc_url(rtrim(ROOT_URL, '/') . '/' . ltrim($image_url, '/')); ?>"
                    alt="<?php echo esc_attr($course['title']); ?>" loading="lazy">
                <?php
                if (!empty($course['collections'])) {
                    $first_col = $course['collections'][0];
                    echo '<span class="card-badge">' . esc_html($first_col['title']) . '</span>';
                }
                ?>
            </div>
            <div class="card-content">

                <h3 class="card-title">
                    <a
                        href="/resources/<?php echo esc_attr($course['slug']); ?>?scope=<?php echo esc_attr($type_key); ?>&id=<?php echo esc_attr($course['id']); ?>">
                        <?php echo esc_html($course['title']); ?>
                    </a>
                </h3>
                <div class="card-tags">
                    <?php
                    $tags = array_slice($course['tags'], 0, 3);
                    foreach ($tags as $tag):
                        ?>
                        <span class="tag"><?php echo esc_html($tag['title']); ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    <?php endforeach;
    return ob_get_clean();
}

// Render pagination
function mac_render_pagination($total, $per_page, $current_page, $course_type)
{
    $total_pages = ceil($total / $per_page);

    if ($total_pages <= 1) {
        return '';
    }

    $base_url = add_query_arg('course', $course_type, get_permalink());

    ob_start();
    ?>
    <div class="pagination-wrapper">
        <?php if ($current_page > 1): ?>
            <a href="<?php echo esc_url(add_query_arg('paged', $current_page - 1, $base_url)); ?>"
                class="pagination-btn prev-btn" data-page="<?php echo $current_page - 1; ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
                Previous
            </a>
        <?php endif; ?>

        <div class="pagination-numbers">
            <?php
            $range = 2;
            for ($i = 1; $i <= $total_pages; $i++):
                if ($i == 1 || $i == $total_pages || ($i >= $current_page - $range && $i <= $current_page + $range)):
                    ?>
                    <a href="<?php echo esc_url(add_query_arg('paged', $i, $base_url)); ?>"
                        class="pagination-number <?php echo $i == $current_page ? 'active' : ''; ?>" data-page="<?php echo $i; ?>">
                        <?php echo $i; ?>
                    </a>
                    <?php
                elseif ($i == $current_page - $range - 1 || $i == $current_page + $range + 1):
                    echo '<span class="pagination-dots">...</span>';
                endif;
            endfor;
            ?>
        </div>

        <?php if ($current_page < $total_pages): ?>
            <a href="<?php echo esc_url(add_query_arg('paged', $current_page + 1, $base_url)); ?>"
                class="pagination-btn next-btn" data-page="<?php echo $current_page + 1; ?>">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </a>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

// AJAX handler for pagination
function mac_load_courses_page()
{
    check_ajax_referer('mac_courses_nonce', 'nonce');

    $course_type = isset($_POST['course_type']) ? sanitize_text_field($_POST['course_type']) : '';
    $page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
    $per_page = 12;

    $course_types = mac_get_all_course_types();

    if (empty($course_type) || !isset($course_types[$course_type])) {
        wp_send_json_error(array('message' => 'Invalid course type'));
    }

    $course_info = $course_types[$course_type];
    $api_data = mac_fetch_all_courses_from_api($course_info['api'], $page, $per_page);

    $html = mac_render_all_courses($api_data['courses'], $course_type);
    $pagination = mac_render_pagination($api_data['total'], $per_page, $page, $course_type);

    wp_send_json_success(array(
        'html' => $html,
        'pagination' => $pagination,
        'total' => $api_data['total'],
        'count' => count($api_data['courses'])
    ));
}
add_action('wp_ajax_mac_load_courses_page', 'mac_load_courses_page');
add_action('wp_ajax_nopriv_mac_load_courses_page', 'mac_load_courses_page');

// Enqueue scripts
function mac_enqueue_all_courses_scripts()
{
    if (is_page('all-course')) {
        // wp_enqueue_script(
        //     'mac-all-courses-frontend',
        //     get_stylesheet_directory_uri() . '/blocks/mac-all-courses-block/frontend.js',
        //     array(),
        //     filemtime(get_stylesheet_directory() . '/blocks/mac-all-courses-block/frontend.js'),
        //     true
        // );

        wp_localize_script('mac-all-courses-frontend', 'macAllCoursesAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('mac_courses_nonce')
        ));
    }
}
add_action('wp_enqueue_scripts', 'mac_enqueue_all_courses_scripts');