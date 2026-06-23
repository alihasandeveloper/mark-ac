<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the Gutenberg block
 */
function mac_register_curriculum_products_block()
{

    wp_register_script(
        'mac-curriculum-product-editor',
        get_stylesheet_directory_uri() . '/blocks/mac-curriculum-product/block.js',
        filemtime(get_stylesheet_directory() . '/blocks/mac-curriculum-product/block.js'),
        true
    );

    // wp_register_style(
    //     'mac-curriculum-product-style',
    //     get_stylesheet_directory_uri() . '/blocks/mac-curriculum-product/style.css',
    //     array(),
    //     filemtime(get_stylesheet_directory() . '/blocks/mac-curriculum-product/style.css')
    // );

    register_block_type('mac-child/curriculum-products', array(
        'editor_script' => 'mac-curriculum-product-editor',
        'editor_style' => 'mac-curriculum-product-editor-style',
        'style' => 'mac-curriculum-product-style',
        'render_callback' => 'mac_render_curriculum_products_block',
    ));
}

add_action('init', 'mac_register_curriculum_products_block');

/**
 * Render callback – displays products from API
 */
function mac_render_curriculum_products_block($attributes)
{
    ob_start();
    ?>
    <div <?php echo get_block_wrapper_attributes(); ?>>

        <div class="mac-unlock-header <?php echo isset($_GET['id']) ?>">
            <h2 class="mac-heading"><?php echo esc_html($attributes['heading'] ?? 'Unlock This Course'); ?></h2>
            <p class="mac-subheading"
                data-subheading-template="<?php echo esc_attr($attributes['subheading'] ?? "You've selected \"{title}\" to begin learning, please choose subscription plan that best fits your goals."); ?>"
                data-course-scope="<?php echo esc_attr(isset($_GET['course']) ? sanitize_text_field($_GET['course']) : 'stories'); ?>">
                <!-- Populated by JavaScript -->
            </p>
        </div>

        <!-- 
        <div class="mac-product-heading">
            <h6 class="mac-heading">
                Products <span>Included In</span>
            </h6>
        </div> -->

        <!-- Loading skeleton -->
        <!-- <div class="mac-products-loading" id="mac-products-loading" style="display: block;">
            <div class="skeleton-wrapper">

                <div class="skeleton-section">
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


                    </div>
                </div>
            </div>
        </div> -->

        <!-- Products grid (populated by JavaScript) -->
        <!-- <div class="mac-products-grid">
        </div> -->

        <!-- Subscription section (populated by JavaScript) -->
        <div class="mac-subscription-section" style="display: none;">
            <div class="mac-subscription-heading">
                <h6 class="mac-heading">
                    Subscriptions <span>Included In</span>
                </h6>
            </div>

            <div class="mac-subscription-grid">
                <!-- Subscriptions will be rendered here by JavaScript -->
            </div>
        </div>

    </div>
    <?php
    return ob_get_clean();
}
