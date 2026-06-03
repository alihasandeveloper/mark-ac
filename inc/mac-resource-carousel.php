<?php
/**
 * Register Mac Resource Carousel Block
 */

function mac_register_resource_carousel_block() {
    // Register the block script
    wp_register_script(
        'mac-resource-carousel-editor',
        get_stylesheet_directory_uri() . '/blocks/mac-resource-carousel/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-resource-carousel/block.js')
    );

    // Register the frontend script
    wp_register_script(
        'mac-resource-carousel-frontend',
        get_stylesheet_directory_uri() . '/blocks/mac-resource-carousel/frontend.js',
        array(),
        filemtime(get_stylesheet_directory() . '/blocks/mac-resource-carousel/frontend.js'),
        true
    );

    // Register the style
    // wp_register_style(
    //     'mac-resource-carousel-style',
    //     get_stylesheet_directory_uri() . '/blocks/mac-resource-carousel/style.css',
    //     array(),
    //     filemtime(get_stylesheet_directory() . '/blocks/mac-resource-carousel/style.css')
    // );

    // Register the block
    register_block_type('mac/resource-carousel', array(
        'editor_script' => 'mac-resource-carousel-editor',
        'script' => 'mac-resource-carousel-frontend',
        'style' => 'mac-resource-carousel-style',
        'render_callback' => 'mac_render_resource_carousel_block',
        'attributes' => array(
            'slides' => array(
                'type' => 'array',
                'default' => array()
            )
        )
    ));
}
add_action('init', 'mac_register_resource_carousel_block');

/**
 * Render callback for the block
 */
function mac_render_resource_carousel_block($attributes) {
    $slides = isset($attributes['slides']) ? $attributes['slides'] : array();
    
    if (empty($slides)) {
        return '';
    }

    ob_start();
    ?>
    <div class="mac-resource-carousel-wrapper">
        <div class="carousel">
            <div class="carousel-track">
                <?php foreach ($slides as $index => $slide): ?>
                    <div class="carousel-slide" style="--slide-index: <?php echo esc_attr($index); ?>;">
                        <?php if (!empty($slide['imageUrl'])): ?>
                            <img
                                src="<?php echo esc_url($slide['imageUrl']); ?>"
                                alt="<?php echo esc_attr($slide['linkText'] ?? 'Slide ' . ($index + 1)); ?>"
                            />
                        <?php endif; ?>
                        <?php if (!empty($slide['linkText']) && !empty($slide['linkUrl'])): ?>
                            <a href="<?php echo esc_url($slide['linkUrl']); ?>" class="slide-button">
                                <?php echo esc_html($slide['linkText']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}