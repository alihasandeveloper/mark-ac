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
    <style>

    </style>
    <?php
    return ob_get_clean();
}

/**
 * AJAX Handler for creating community post
 */
function mac_create_community_post()
{
    check_ajax_referer('mac_community_nonce', 'nonce');

    $title = isset($_POST['email']) ? sanitize_text_field($_POST['email']) : '';

    if (empty($title)) {
        wp_send_json_error(array('message' => 'Please provide your email to join the community.'));
    }

    // Check if post already exists
    $existing_post = get_page_by_title($title, OBJECT, 'community');
    if ($existing_post) {
        wp_send_json_error(array('message' => 'This email is already registered in our community!'));
    }

    $post_id = wp_insert_post(array(
        'post_title' => $title,
        'post_type' => 'community',
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) {
        wp_send_json_error(array('message' => 'We encountered an issue while adding you to the community. Please try again.'));
    }

    wp_send_json_success(array('message' => 'Congratulations! You are now part of our community.'));
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

