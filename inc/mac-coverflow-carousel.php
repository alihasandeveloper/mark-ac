<?php
/**
 * Simple Mac Coverflow Carousel Block
 */

function mac_simple_carousel_init() {
    wp_register_script(
        'mac-carousel-block',
        get_stylesheet_directory_uri() . '/blocks/mac-coverflow-carousel/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-coverflow-carousel/block.js')
    );

    wp_register_style(
        'mac-carousel-style',
        get_stylesheet_directory_uri() . '/blocks/mac-coverflow-carousel/style.css',
        array(),
        filemtime(get_stylesheet_directory() . '/blocks/mac-coverflow-carousel/style.css')
    );

    wp_register_script(
        'mac-carousel-frontend',
        get_stylesheet_directory_uri() . '/blocks/mac-coverflow-carousel/frontend.js',
        array(),
        filemtime(get_stylesheet_directory() . '/blocks/mac-coverflow-carousel/frontend.js'),
        true
    );

    register_block_type('mac/coverflow-carousel', array(
        'editor_script' => 'mac-carousel-block',
        'style' => 'mac-carousel-style',
        'render_callback' => 'mac_carousel_render',
        'attributes' => array(
            'images' => array('type' => 'array', 'default' => array())
        )
    ));
}
add_action('init', 'mac_simple_carousel_init');

function mac_carousel_render($attributes) {
    $images = isset($attributes['images']) ? $attributes['images'] : array();
    
    if (empty($images)) {
        return '<p>Add images to carousel</p>';
    }

    wp_enqueue_style('mac-carousel-style');
    wp_enqueue_script('mac-carousel-frontend');

    $id = 'carousel-' . uniqid();
    
    ob_start();
    ?>
    <div class="mac-carousel-wrap">
        <div class="mac-carousel" id="<?php echo $id; ?>">
            <?php foreach ($images as $image): ?>
                <div class="mac-slide">
                    <img src="<?php echo esc_url($image['url']); ?>" alt="">
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
} 