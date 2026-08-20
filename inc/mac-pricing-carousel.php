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
            ),
            'showStaticCard' => array(
                'type' => 'boolean',
                'default' => false
            ),
            'staticCardTag' => array(
                'type' => 'string',
                'default' => 'Bundle & Save'
            ),
            'staticCardTitle' => array(
                'type' => 'string',
                'default' => 'How Your Subscription Works'
            ),
            'staticCardSubtitle' => array(
                'type' => 'string',
                'default' => 'Simple steps to access, choose, and use your monthly resources.'
            ),
            'staticCardSteps' => array(
                'type' => 'array',
                'default' => array(
                    array(
                        'badgeText' => '01',
                        'badgeClass' => 'purple',
                        'title' => 'Subscribe & Log In',
                        'desc' => 'Your subscription gives you access to your resource library.',
                        'iconUrl' => 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/80060c9c-04c7-47b2-bd7d-daa4dab16d4c.png'
                    ),
                    array(
                        'badgeText' => '02',
                        'badgeClass' => 'orange',
                        'title' => 'Choose Your Content',
                        'desc' => 'Each month, log in and choose your 4 new Bible stories, kid services, or Bible Lab lessons.',
                        'iconUrl' => 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/97804eec-6417-4d9d-ad5c-f2a3f041d877.png'
                    ),
                    array(
                        'badgeText' => '03',
                        'badgeClass' => 'green',
                        'title' => 'Download & Use',
                        'desc' => 'Download your resources and use them whenever you\'re ready.',
                        'iconUrl' => 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/125955e7-329f-4da1-b8e5-11d90327c432.png'
                    )
                )
            ),
            'staticCardFooterIcon' => array(
                'type' => 'string',
                'default' => 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/Background.svg'
            ),
            'staticCardFooterText' => array(
                'type' => 'string',
                'default' => 'Your subscription includes <span class="highlight-blue">4 new downloads</span> each month. You can choose and download them when you\'re ready!'
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

    // Get static card attributes
    $show_static_card = isset($attributes['showStaticCard']) ? $attributes['showStaticCard'] : false;
    $static_card_tag = isset($attributes['staticCardTag']) ? $attributes['staticCardTag'] : 'Bundle & Save';
    $static_card_title = isset($attributes['staticCardTitle']) ? $attributes['staticCardTitle'] : 'How Your Subscription Works';
    $static_card_subtitle = isset($attributes['staticCardSubtitle']) ? $attributes['staticCardSubtitle'] : 'Simple steps to access, choose, and use your monthly resources.';
    $static_card_steps = isset($attributes['staticCardSteps']) ? $attributes['staticCardSteps'] : array();
    $static_card_footer_icon = isset($attributes['staticCardFooterIcon']) ? $attributes['staticCardFooterIcon'] : '';
    $static_card_footer_text = isset($attributes['staticCardFooterText']) ? $attributes['staticCardFooterText'] : '';

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

    // Group plans by tags
    $group_plans_by_tags = function ($plans) {
        $grouped = array();
        foreach ($plans as $plan) {
            $tags = !empty($plan['tags']) ? $plan['tags'] : array('Plans');
            foreach ($tags as $tag) {
                if (!isset($grouped[$tag])) {
                    $grouped[$tag] = array();
                }
                $grouped[$tag][] = $plan;
            }
        }
        return $grouped;
    };

    $monthly_grouped = $group_plans_by_tags($monthly_plans);
    $yearly_grouped = $group_plans_by_tags($yearly_plans);





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
            <?php if (!empty($monthly_grouped)): ?>
                <?php foreach ($monthly_grouped as $tag_name => $plans): ?>
                    <div class="mac-pricing-group" style="margin-bottom: 40px;">
                        <h2 class="mac-pricing-group-heading">
                            <?php echo esc_html($tag_name); ?>
                        </h2>
                        <div class="mac-pricing-slider-container">
                            <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid' : 'mac-pricing-swiper swiper'; ?>">
                                <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-wrapper' : 'swiper-wrapper'; ?>">
                                    <?php foreach ($plans as $plan):
                                        echo mac_render_pricing_card($plan, 'month', $layout);
                                    endforeach; ?>
                                    <?php if ($show_static_card && $tag_name === $static_card_tag): ?>
                                        <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-item' : 'swiper-slide'; ?>">
                                            <div class="pricing-card-how-it-works">
                                                <h3 class="sub-works-title"><?php echo esc_html($static_card_title); ?></h3>
                                                <p class="sub-works-subtitle"><?php echo esc_html($static_card_subtitle); ?></p>
                                                
                                                <div class="sub-works-steps">
                                                    <?php foreach ($static_card_steps as $step): ?>
                                                        <div class="sub-works-step <?php echo esc_attr($step['badgeClass'] ?? 'purple'); ?>-bg">
                                                            <div class="sub-works-icon-wrapper">
                                                                <?php if (!empty($step['iconUrl'])): ?>
                                                                    <img src="<?php echo esc_url($step['iconUrl']); ?>" alt="">
                                                                <?php endif; ?>
                                                            </div>
                                                            <div class="sub-works-step-content">
                                                                <h4 class="sub-works-step-title">
                                                                    <span class="badge <?php echo esc_attr($step['badgeClass'] ?? 'purple'); ?>"><?php echo esc_html($step['badgeText'] ?? ''); ?></span> 
                                                                    <?php echo esc_html($step['title'] ?? ''); ?>
                                                                </h4>
                                                                <p class="sub-works-step-desc"><?php echo esc_html($step['desc'] ?? ''); ?></p>
                                                            </div>
                                                        </div>
                                                    <?php endforeach; ?>
                                                </div>
                                                
                                                <div class="sub-works-footer-box">
                                                    <div class="sub-works-footer-icon">
                                                        <?php if (!empty($static_card_footer_icon)): ?>
                                                            <img src="<?php echo esc_url($static_card_footer_icon); ?>" alt="">
                                                        <?php endif; ?>
                                                    </div>
                                                    <p class="sub-works-footer-text">
                                                        <?php echo wp_kses_post($static_card_footer_text); ?>
                                                    </p>
                                                </div>
                                            </div>
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
                <?php endforeach; ?>
            <?php else: ?>
                <div class="no-plans-message" style="text-align: center; padding: 40px 20px;">No pricing plans available for
                    monthly.</div>
            <?php endif; ?>
        </div>

        <!-- Yearly Carousel/Grid -->
        <div class="mac-pricing-carousel-container" data-pricing-period="year" style="display: none;">
            <?php if (!empty($yearly_grouped)): ?>
                <?php foreach ($yearly_grouped as $tag_name => $plans): ?>
                    <div class="mac-pricing-group" style="margin-bottom: 40px;">
                        <h2 class="mac-pricing-group-heading">
                            <?php echo esc_html($tag_name); ?>
                        </h2>
                        <div class="mac-pricing-slider-container">
                            <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid' : 'mac-pricing-swiper swiper'; ?>">
                                <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-wrapper' : 'swiper-wrapper'; ?>">
                                    <?php foreach ($plans as $plan):
                                        echo mac_render_pricing_card($plan, 'year', $layout);
                                    endforeach; ?>
                                    <?php if ($show_static_card && $tag_name === $static_card_tag): ?>
                                        <div class="<?php echo $layout === 'grid' ? 'mac-pricing-grid-item' : 'swiper-slide'; ?>">
                                            <div class="pricing-card-how-it-works">
                                                <h3 class="sub-works-title"><?php echo esc_html($static_card_title); ?></h3>
                                                <p class="sub-works-subtitle"><?php echo esc_html($static_card_subtitle); ?></p>
                                                
                                                <div class="sub-works-steps">
                                                    <?php foreach ($static_card_steps as $step): ?>
                                                        <div class="sub-works-step <?php echo esc_attr($step['badgeClass'] ?? 'purple'); ?>-bg">
                                                            <div class="sub-works-icon-wrapper">
                                                                <?php if (!empty($step['iconUrl'])): ?>
                                                                    <img src="<?php echo esc_url($step['iconUrl']); ?>" alt="">
                                                                <?php endif; ?>
                                                            </div>
                                                            <div class="sub-works-step-content">
                                                                <h4 class="sub-works-step-title">
                                                                    <span class="badge <?php echo esc_attr($step['badgeClass'] ?? 'purple'); ?>"><?php echo esc_html($step['badgeText'] ?? ''); ?></span> 
                                                                    <?php echo esc_html($step['title'] ?? ''); ?>
                                                                </h4>
                                                                <p class="sub-works-step-desc"><?php echo esc_html($step['desc'] ?? ''); ?></p>
                                                            </div>
                                                        </div>
                                                    <?php endforeach; ?>
                                                </div>
                                                
                                                <div class="sub-works-footer-box">
                                                    <div class="sub-works-footer-icon">
                                                        <?php if (!empty($static_card_footer_icon)): ?>
                                                            <img src="<?php echo esc_url($static_card_footer_icon); ?>" alt="">
                                                        <?php endif; ?>
                                                    </div>
                                                    <p class="sub-works-footer-text">
                                                        <?php echo wp_kses_post($static_card_footer_text); ?>
                                                    </p>
                                                </div>
                                            </div>
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
                <?php endforeach; ?>
            <?php else: ?>
                <div class="no-plans-message" style="text-align: center; padding: 40px 20px;">No pricing plans available for
                    yearly.</div>
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

    $is_home_page = is_front_page();
    $is_resources = !empty($plan['tags']) && in_array('Resources', $plan['tags']);
    $is_home_resources = $is_home_page && $is_resources;

    if ($is_home_resources) {
        $button_text = 'Explore Resource';
        $scope = $plan['scope'] ?? '';
        $current_id = $plan['id'];

        if ($scope === 'stories') {
            $button_link = '/bible-story-images?tierId=' . $current_id;
        } elseif ($scope === 'series') {
            $button_link = '/curriculum?scope=series&tierId=' . $current_id;
        } elseif ($scope === 'handbooks') {
            $button_link = '/curriculum?scope=handbooks&tierId=' . $current_id;
        } else {
            $button_link = '/checkout?subscription=' . $current_id;
        }
    } else {
        $button_text = $plan['button_text'] ?? 'Subscribe Now';
        $button_link = '/checkout?subscription=' . $plan['id'];
    }

    ob_start();
    ?>
    <div class="<?php echo esc_attr($wrapper_class); ?>">
        <div class="pricing-card" data-tier-id="<?php echo esc_attr($plan['id']); ?>">

            <div class="pricing-card-image-wrapper">
                <?php if (!empty($plan['image'])): ?>
                    <?php if ($is_home_resources): ?>
                        <a href="<?php echo esc_url($button_link); ?>">
                            <img src="<?php echo esc_url(getImageUrl(ltrim($plan['image']))); ?>"
                                alt="<?php echo esc_attr($plan['title']); ?>" class="pricing-card-image">
                        </a>
                    <?php else: ?>
                        <img src="<?php echo esc_url(getImageUrl(ltrim($plan['image']))); ?>"
                            alt="<?php echo esc_attr($plan['title']); ?>" class="pricing-card-image">
                    <?php endif; ?>
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
                
                <?php if($plan['subtitle']): ?>
                    <span style="display: block;margin-bottom: 16px;font-size:16px;line-height:22px;color:#595959;"><?php echo esc_html($plan['subtitle']); ?></span>
                <?php endif; ?>
                            <?php 
                    if ($is_resources):
                        $scope = $plan['scope'] ?? '';
                        $card_audience = '';
                        $card_download_text = '';

                        if ($scope === 'stories') {
                            $card_audience = 'Ages 5+';
                            $card_download_text = 'Download 4 new Bible stories each month';
                        } elseif ($scope === 'series') {
                            $card_audience = 'Grades K-5';
                            $card_download_text = 'Download 4 new kids services each month';
                        } elseif ($scope === 'handbooks') {
                            $card_audience = 'Ages 6+ (Varies by course)';
                            $card_download_text = 'Download 4 new lessons each month';
                        }

                        if ($card_audience || $card_download_text):
                            ?>
                            <div class="library-card__meta">
                                <?php if ($card_audience): ?>
                                    <p class="library-card__audience"><?php echo esc_html($card_audience); ?></p>
                                <?php endif; ?>
                                <?php if ($card_download_text): ?>
                                    <p class="library-card__download"><?php echo esc_html($card_download_text); ?></p>
                                <?php endif; ?>
                            </div>
                            <?php 
                        endif;
                    endif; 
            ?>
                <?php if (!$is_home_resources): ?>
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
                <?php endif; ?>

                <?php if (!empty($plan['features']) && is_array($plan['features'])): ?>
                    <ul class="pricing-card-features">
                        <?php foreach ($plan['features'] as $feature): ?>
                            <li>
                                <svg viewBox="64 64 896 896" focusable="false" data-icon="check" width="12px" height="12px" fill="#0d0d0d" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path></svg>
                                <?php echo esc_html($feature); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>

                <a href="<?php echo esc_url($button_link); ?>" class="pricing-card-button"
                    data-tier-slug="<?php echo esc_attr($plan['slug']); ?>">
                    <?php echo esc_html($button_text); ?>
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
            'tier_id' => !empty($tier['id']) ? $tier['id'] : '',
            'title' => $tier['title'],
            'subtitle' => $tier['subtitle'],
            'description' => $tier['description'],
            'price' => floatval($item['price']),
            'currency' => $item['currency'],
            'interval' => $interval,
            'image' => !empty($tier['image']) ? $tier['image'] : null,
            'features' => !empty($tier['features']) ? $tier['features'] : array(),
            'slug' => $tier['slug'],
            'tags' => !empty($tier['tags']) ? $tier['tags'] : array(),
            'scope' => !empty($tier['scope']) ? $tier['scope'] : '',
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