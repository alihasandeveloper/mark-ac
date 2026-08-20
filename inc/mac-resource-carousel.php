<?php
/**
 * Register Mac Resource Carousel Block
 */

function mac_register_resource_carousel_block()
{
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
function mac_render_resource_carousel_block($attributes)
{
    $static_slides = isset($attributes['slides']) ? $attributes['slides'] : array();

    if (empty($static_slides)) {
        return '';
    }

    $api = "https://api.markandrewscreative.com/api/v1/courses/public/featured-courses/";

    $response = wp_remote_get($api, array(
        'timeout' => 15,
    ));

    if (is_wp_error($response)) {
        return '';
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        return '';
    }

    $results = $data['results'] ?? [];

    $slides = [];

    if (!empty($static_slides)) {
        $slides[] = [
            'title' => $static_slides[0]['linkText'] ?? '',
            'type' => 'course',
            'scope' => 'bible-image',
            'image' => $static_slides[0]['imageUrl'] ?? '',
            'slug' => $static_slides[0]['linkUrl'] ?? '',
        ];
    }

   if (!empty($results)) {
    foreach ($results as $result) {
        $slides[] = [
            'title' => $result['title'] ?? '',
            'type' => $result['type'] ?? '',
            'scope' => $result['scope'] ?? '',
            'course_id' => ($result['type'] ?? '') === 'course'
                ? ($result['course_id'] ?? '')
                : (($result['type'] ?? '') === 'tier'
                    ? ($result['tier']['id'] ?? '')
                    : ''),
            'image' => $result['course']['image'] ?? $result['tier']['image'] ?? '',
            'slug' => $result['course']['slug'] ?? $result['tier']['slug'] ?? '',
        ];
    }
}

    ob_start();
    ?>
    <div class="mac-resource-carousel-wrapper">
        <div class="carousel">
            <button class="carousel-prev" type="button" aria-label="Previous slide">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="carousel-track">
                <?php foreach ($slides as $index => $slide):
                    $slide_url = mac_dynamic_url_changer($slide['slug'] ?? '', $slide['scope'] ?? '', $slide['course_id'] ?? '', $slide['type'] ?? '');
                    ?>
                    <div class="carousel-slide" style="--slide-index: <?php echo esc_attr($index); ?>;">
                        <?php if (!empty($slide['image'])): ?>
                            <img src="<?php echo esc_url($slide['image']); ?>"
                                alt="<?php echo esc_attr($slide['title'] ?? 'Slide ' . ($index + 1)); ?>" />
                        <?php endif; ?>
                        <?php if (!empty($slide['title']) && !empty($slide_url)): ?>
                            <a href="<?php echo esc_url($slide_url); ?>" class="slide-button">
                                <?php echo esc_html($slide['title']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button class="carousel-next" type="button" aria-label="Next slide">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}


function mac_dynamic_url_changer($slug = '', $scope = '', $course_id = '', $type = '')
{
    if (empty($slug)) {
        return '';
    }
    if ($type === 'course') {
        if ($scope === 'bible-image') {
            return $slug;
        } elseif ($scope === 'vbsify_series') {
            return '/library/' . rawurlencode($slug) . '?scope=series&id=' . rawurlencode($course_id);
        } elseif ($scope === 'handbooks') {
            return '/library/' . rawurlencode($slug) . '?scope=handbooks&id=' . rawurlencode($course_id);
        } elseif ($scope === 'bible_stories') {
            return '/library/' . rawurlencode($slug) . '?scope=stories&id=' . rawurlencode($course_id);
        }
    } elseif ($type === 'tier') {
        if ($scope === 'vbsify_series') {
            return '/curriculum/' . '?scope=series&tierId=' . rawurlencode($course_id);
        } elseif ($scope === 'handbooks') {
            return '/curriculum/' . '?scope=handbooks&tierId=' . rawurlencode($course_id);
        } elseif ($scope === 'bible_stories') {
            return '/curriculum/' . '?scope=stories&tierId=' . rawurlencode($course_id);
        }
    }


    return '/library/' . rawurlencode($slug) . (!empty($scope) ? '?scope=' . rawurlencode($scope) : '') . (!empty($course_id) ? '&id=' . rawurlencode($course_id) : '');
}