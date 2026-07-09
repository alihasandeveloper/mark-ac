<?php
/**
 * Register and render MAC Community Block
 */

// Register the block
function mac_register_community_block()
{
    // Register block script
    wp_register_script(
        'mac-community-block-script',
        get_stylesheet_directory_uri() . '/blocks/mac-community/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-community/block.js')
    );

    // Register the block
    register_block_type('mac-theme/community-block', array(
        'editor_script' => 'mac-community-block-script',
        'render_callback' => 'mac_render_community_block'
    ));
}
add_action('init', 'mac_register_community_block');

/**
 * Render Callback
 */
function mac_render_community_block($attributes)
{
    ob_start();
    ?>
    <div class="mac-community-form-wrapper">
        <form id="mac-community-post-form">
            <div class="form-group">
                <input type="email" name="community_email" id="community_email" placeholder="Enter your email..." required>
                <button type="submit" id="submit-community-post">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fafafa" class="size-6">
                        <path
                            d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                    </svg>

                </button>
            </div>
            <div id="form-response-message"></div>
        </form>
    </div>

    <!-- Success Modal Popup -->
    <div class="mac-modal-overlay" id="mac-success-modal">
        <div class="mac-modal-card">
            <div class="mac-modal-icon-wrapper">
                <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3 class="mac-modal-title">Success!</h3>
            <p class="mac-modal-message">Your free resource is on its way. Please check your inbox shortly!</p>
            <button class="mac-modal-btn" id="mac-modal-close-btn">Got it</button>
        </div>
    </div>

    <?php
    return ob_get_clean();
}

/**
 * AJAX Handler for creating community post
 */
function mac_create_community_post()
{
    check_ajax_referer('mac_community_nonce', 'nonce');

    $title = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';

    if (empty($title)) {
        wp_send_json_error(array('message' => 'Something went wrong. Please provide a valid email address.'));
    }

    // Check if this email already claimed a free resource
    $existing = new WP_Query(array(
        'post_type' => 'community',
        'title' => $title,
        'post_status' => 'publish',
        'posts_per_page' => 1,
        'fields' => 'ids',
    ));

    if ($existing->have_posts()) {
        wp_send_json_error(array('message' => 'You have already claimed your free resource.'));
    }

    // Send to external API
    $api_url = BASE_API . '/resources/admin/free-resource/send-free-resource/';
    $response = wp_remote_post($api_url, array(
        'method' => 'POST',
        'timeout' => 15,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode(array(
            'email' => $title,
        )),
    ));

    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => 'Something went wrong. Please try again in a moment.'));
    }

    $response_code = wp_remote_retrieve_response_code($response);

    if ($response_code < 200 || $response_code >= 300) {
        wp_send_json_error(array('message' => 'Something went wrong. Please try again later.'));
    }

    $post_id = wp_insert_post(array(
        'post_title' => $title,
        'post_type' => 'community',
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) {
        wp_send_json_error(array('message' => 'Something went wrong. Please try again.'));
    }

    wp_send_json_success(array('message' => 'You have successfully joined our community!'));
}


add_action('wp_ajax_mac_create_community_post', 'mac_create_community_post');
add_action('wp_ajax_nopriv_mac_create_community_post', 'mac_create_community_post');

function mac_get_nonce()
{
    wp_send_json_success(array(
        'nonce' => wp_create_nonce('mac_community_nonce'),
        'ajax_url' => admin_url('admin-ajax.php')
    ));
}
add_action('wp_ajax_mac_get_nonce', 'mac_get_nonce');
add_action('wp_ajax_nopriv_mac_get_nonce', 'mac_get_nonce');

