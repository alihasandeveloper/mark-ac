<?php
/**
 * Complete Pricing Carousel Block Setup
 * Add this to your theme's functions.php or plugin file
 */

/**
 * Register and setup pricing carousel block
 */
function mac_register_pricing_carousel_block()
{
    // Register block editor script
    wp_register_script(
            'mac-pricing-carousel-block',
            get_stylesheet_directory_uri() . '/blocks/mac-pricing-carousel/block.js',
            array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
            filemtime(get_stylesheet_directory() . '/blocks/mac-pricing-carousel/block.js')
    );

    // Register block styles
//     wp_register_style(
//         'mac-pricing-carousel-style',
//         get_stylesheet_directory_uri() . '/blocks/mac-pricing-carousel/style.css',
//         array('swiper-css'),
//         filemtime(get_stylesheet_directory() . '/blocks/mac-pricing-carousel/style.css')
//     );

    // Register the block
    register_block_type('mac/pricing-carousel', array(
            'editor_script' => 'mac-pricing-carousel-block',
            'script' => 'mac-pricing-carousel-frontend',
            'style' => 'mac-pricing-carousel-style',
            'render_callback' => 'mac_pricing_carousel_render_callback',
            'attributes' => array(
                    'layout' => array(
                            'type' => 'string',
                            'default' => 'slider'
                    ),
                    'numberOfPlans' => array(
                            'type' => 'number',
                            'default' => 3
                    ),
                    'autoplay' => array(
                            'type' => 'boolean',
                            'default' => true
                    ),
                    'slidesToShow' => array(
                            'type' => 'number',
                            'default' => 3
                    )
            )
    ));
}
add_action('init', 'mac_register_pricing_carousel_block');

/**
 * Render callback - builds the HTML in PHP
 */
function mac_pricing_carousel_render_callback($attributes, $content)
{
    // Get layout attribute (default to 'slider')
    $layout = isset($attributes['layout']) ? $attributes['layout'] : 'slider';

    // Fetch pricing data
    $pricing_data = mac_fetch_pricing_data();
    $error_message = empty($pricing_data) ? 'No pricing information found.' : '';

    // Handle error case
    if (!$pricing_data || $error_message) {
        return '<div class="mac-pricing-error" style="color: #666; padding: 20px; text-align: center;">'
                . esc_html($error_message ?: 'Error loading pricing data')
                . '</div>';
    }

    $monthly_plans = $pricing_data['month'] ?? [];
    $yearly_plans = $pricing_data['year'] ?? [];

    // Start output buffering
    ob_start();
    ?>

    <div class="mac-pricing-carousel-wrapper" data-layout="<?php echo esc_attr($layout); ?>">
        <!-- Tabs -->
        <div class="mac-pricing-tabs">
            <button class="mac-pricing-tab active" data-period="month">Monthly</button>
            <button class="mac-pricing-tab" data-period="year">Yearly</button>
        </div>

        <!-- Monthly Carousel/Grid -->
        <div class="mac-pricing-carousel-container" data-pricing-period="month">
            <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid' : 'mac-pricing-swiper swiper'; ?>">
                <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-wrapper' : 'swiper-wrapper'; ?>">
                    <?php if (!empty($monthly_plans)): ?>
                        <?php foreach ($monthly_plans as $plan):
                            echo mac_render_pricing_card($plan, 'month', $layout);
                        endforeach; ?>
                    <?php else: ?>
                        <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-item' : 'swiper-slide'; ?>">
                            <div class="no-plans-message">No pricing plans available for monthly.</div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php if ($layout === 'slider'): ?>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            <?php endif; ?>
        </div>

        <!-- Yearly Carousel/Grid -->
        <div class="mac-pricing-carousel-container" data-pricing-period="year" style="display: none;">
            <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid' : 'mac-pricing-swiper swiper'; ?>">
                <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-wrapper' : 'swiper-wrapper'; ?>">
                    <?php if (!empty($yearly_plans)): ?>
                        <?php foreach ($yearly_plans as $plan):
                            echo mac_render_pricing_card($plan, 'year', $layout);
                        endforeach; ?>
                    <?php else: ?>
                        <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-item' : 'swiper-slide'; ?>">
                            <div class="no-plans-message">No pricing plans available for yearly.</div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php if ($layout === 'slider'): ?>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            <?php endif; ?>
        </div>
    </div>

    <?php
    return ob_get_clean();
}

/**
 * Render individual pricing card
 */
function mac_render_pricing_card($plan, $period, $layout = 'slider')
{
    $features = !empty($plan['features']) ? $plan['features'] : [
            'Access to all features',
            'Priority support',
            'Regular updates',
            'Cancel anytime'
    ];

    $period_label = $period === 'month' ? 'month' : 'year';
    $wrapper_class = $layout === 'grid' ? 'mac-pricing-grid-item' : 'swiper-slide';

    ob_start();
    ?>
    <div class="<?php echo esc_attr($wrapper_class); ?>">
        <div class="pricing-card" data-tier-id="<?php echo esc_attr($plan['id']); ?>">

            <div class="pricing-card-image-wrapper">
                <?php if (!empty($plan['image'])): ?>
                    <img src="<?php echo esc_url(rtrim(ROOT_URL, '/') . '/' . ltrim($plan['image'], '/')); ?>"
                         alt="<?php echo esc_attr($plan['title']); ?>" class="pricing-card-image">
                <?php else: ?>
                    <div class="pricing-card-placeholder">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <rect width="80" height="80" fill="#e0e0e0" />
                            <path d="M40 20L50 40H30L40 20Z" fill="#999" />
                            <circle cx="40" cy="55" r="8" fill="#999" />
                        </svg>
                    </div>
                <?php endif; ?>
            </div>

            <div class="pricing-card-content">
                <h3 class="pricing-card-title"><?php echo esc_html($plan['title']); ?></h3>
                <div class="pricing-card-price">
                    <?php if (floatval($plan['price']) === 0.0): ?>
                        <span class="price-free">00.00</span>
                    <?php else: ?>
                        <h5>
                            <span
                                    class="price-currency"><?php echo $plan['currency'] === 'USD' ? '$' : esc_html($plan['currency']); ?></span>
                            <span class="price-amount"><?php echo floor($plan['price']); ?></span>
                            <span class="price-interval">/<?php echo $period_label; ?></span>
                        </h5>
                    <?php endif; ?>
                </div>
                <?php if (!empty($plan['features']) && is_array($plan['features'])): ?>
                    <ul class="pricing-card-features">
                        <?php foreach ($plan['features'] as $feature): ?>
                            <li><?php echo esc_html($feature); ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
                <a href="<?php echo esc_url('/checkout?subscription=' . $plan['id']); ?>"  class="pricing-card-button"
                   data-tier-slug="<?php echo esc_attr($plan['slug']); ?>">
                    <?php echo esc_html($plan['button_text'] ?? 'Subscribe Now'); ?>
                </a>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Fetch pricing data from API
 */
function mac_fetch_pricing_data()
{
//    // Check for cached data (cache for 1 hour)
//    $cache_key = 'mac_pricing_data';
//    $cached_data = get_transient($cache_key);
//
//    if (false !== $cached_data) {
//        return $cached_data;
//    }

    // Fetch from API
    $api_url = BASE_API . '/billing/public/tiers/?page=1&page_size=1000';

    $response = wp_remote_get($api_url, array(
            'timeout' => 15,
            'headers' => array(
                    'Accept' => 'application/json',
            )
    ));

    if (is_wp_error($response)) {
        error_log('MAC Pricing API Error: ' . $response->get_error_message());
        return array();
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (empty($data['results'])) {
        return array();
    }

    // Transform API data to our format
    $transformed_data = mac_transform_pricing_data($data['results']);

    return $transformed_data;
}

/**
 * Transform API data to match our carousel format
 */
function mac_transform_pricing_data($results)
{
    $pricing = array(
            'month' => array(),
            'year' => array()
    );

    foreach ($results as $item) {
        $interval = $item['interval'];
        $tier = $item['subscription_tier'];

        // Skip if not monthly or yearly
        if (!in_array($interval, array('month', 'year'))) {
            continue;
        }

        $plan = array(
                'id' => $item['id'],
                'title' => $tier['title'],
                'description' => $tier['description'],
                'price' => floatval($item['price']),
                'currency' => $item['currency'],
                'interval' => $interval,
                'image' => !empty($tier['image']) ? $tier['image'] : null,
                'features' => !empty($tier['features']) ? $tier['features'] : array(),
                'slug' => $tier['slug'],
                'button_text' => 'Subscribe Now',
                'button_link' => '#'
        );

        $pricing[$interval][] = $plan;
    }

    return $pricing;
}

/**
 * Clear pricing cache on demand
 */
function mac_clear_pricing_cache()
{
    delete_transient('mac_pricing_data');
}

/**
 * Add admin bar button to clear cache
 */
add_action('admin_bar_menu', 'mac_add_clear_pricing_cache_button', 100);
function mac_add_clear_pricing_cache_button($admin_bar)
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $admin_bar->add_menu(array(
            'id' => 'mac-clear-pricing-cache',
            'title' => 'Clear Pricing Cache',
            'href' => wp_nonce_url(admin_url('admin-post.php?action=mac_clear_pricing_cache'), 'mac_clear_cache'),
    ));
}

/**
 * Handle cache clearing
 */
add_action('admin_post_mac_clear_pricing_cache', 'mac_handle_clear_pricing_cache');
function mac_handle_clear_pricing_cache()
{
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    check_admin_referer('mac_clear_cache');

    mac_clear_pricing_cache();

    wp_redirect(wp_get_referer());
    exit;
}