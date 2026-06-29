<?php
/**
 * Recommended way to include parent theme styles.
 * (Please see http://codex.wordpress.org/Child_Themes#How_to_Create_a_Child_Theme)
 *
 */

// define('BASE_API', 'https://mac-dev-api.boomdevs.net/api/v1');
// define('ROOT_URL', 'https://mac-dev-api.boomdevs.net');
// define('WP_BASE_URL', 'https://mark-ac.boomdevs.net/');

define('BASE_API', 'https://api.markandrewscreative.com/api/v1');
define('ROOT_URL', 'https://api.markandrewscreative.com');
define('WP_BASE_URL', 'https://wp.markandrewscreative.com/');


add_action('wp_enqueue_scripts', 'frontis_child_style');
function frontis_child_style()
{
	wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');

	wp_enqueue_style(
		'swiper-css',
		get_stylesheet_directory_uri() . '/assets/css/swiper/swiper-bundle.min.css',
		array(),
		'12.0.3'
	);

	wp_enqueue_style('child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'));

	//enqueue script
	wp_enqueue_script(
		'swiper-js',
		get_stylesheet_directory_uri() . '/assets/js/swiper/swiper-bundle.min.js',
		array(),
		'12.0.3',
		true
	);

	// Main script depends on Swiper — enqueue Swiper first.
	wp_enqueue_script(
		'main-script',
		get_stylesheet_directory_uri() . '/assets/js/main.js',
		array('swiper-js'),
		filemtime(get_stylesheet_directory() . '/assets/js/main.js'),
		true
	);

	wp_enqueue_script(
		'gsap-script',
		get_stylesheet_directory_uri() . '/assets/js/gsap.min.js',
		array(),
		'3.14.1',
		true
	);

	wp_enqueue_script(
		'gsap-split-text',
		get_stylesheet_directory_uri() . '/assets/js/SplitText.min.js',
		array(),
		'3.14.1',
		true
	);

	wp_enqueue_script(
		'gsap-scroll-trigger',
		get_stylesheet_directory_uri() . '/assets/js/ScrollTrigger.min.js',
		array(),
		'3.14.1',
		true
	);

	// Localize script with AJAX URL
	wp_localize_script('main-script', 'macCurriculumAjax', array(
		'ajaxurl' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('mac_curriculum_nonce')
	));

	// Localize for Community Form AJAX
	wp_localize_script('main-script', 'macCommunityData', array(
		'ajax_url' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('mac_community_nonce')
	));
}

/**
 * Your code goes below.
 */
require_once get_stylesheet_directory() . '/inc/custom-blocks.php';

define('WP_NEXT_APP_URL', 'https://markandrewscreative.com');


add_action('init', function () {
	$allowed_origins = [
		WP_NEXT_APP_URL,
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
	];

	if (isset($_SERVER['HTTP_ORIGIN'])) {
		$origin = $_SERVER['HTTP_ORIGIN'];
		if (in_array($origin, $allowed_origins) || strpos($origin, 'localhost') !== false) {
			header("Access-Control-Allow-Origin: " . $origin);
			header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
			header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization");
			header("Access-Control-Allow-Credentials: true");
		}
	}

	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
		if (isset($_SERVER['HTTP_ORIGIN']) && (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins) || strpos($_SERVER['HTTP_ORIGIN'], 'localhost') !== false)) {
			status_header(200);
			exit;
		}
	}
});


//Register community post type


add_action('init', 'register_community_post');

function register_community_post()
{

	$labels = [
		'name' => 'Communities',
		'singular_name' => 'Community',
		'add_new' => 'Add New',
		'add_new_item' => 'Add New Community',
		'edit_item' => 'Edit Community',
		'new_item' => 'New Community',
		'view_item' => 'View Community',
		'search_items' => 'Search Communities',
		'not_found' => 'No communities found',
		'not_found_in_trash' => 'No communities found in trash',
	];

	$args = [
		'labels' => $labels,
		'public' => false,
		'show_ui' => true,
		'show_in_menu' => true,
		'publicly_queryable' => false,
		'exclude_from_search' => true,
		'has_archive' => false,
		'menu_icon' => 'dashicons-email-alt',
		'supports' => ['title'],
		'show_in_rest' => false,
	];

	register_post_type('community', $args);
}

function getImageUrl($imageUrl) {
    if (!$imageUrl) return '';

    $isDev = false;

    // If backend already sends full URL (prod)
    if (!$isDev && strpos($imageUrl, 'http') === 0) {
        return $imageUrl;
    }

    // If backend sends relative path (dev)
    if ($isDev && strpos($imageUrl, 'http') !== 0) {
        return joinUrl(ROOT_URL, $imageUrl);
    }

    return $imageUrl;
}

function normalizeBaseUrl($url) {
    return rtrim($url ?? '', '/');
}

function joinUrl(...$parts) {
    $parts = array_filter($parts, fn($part) => !empty($part));

    $normalized = [];

    foreach ($parts as $index => $part) {
        if ($index === 0) {
            $normalized[] = normalizeBaseUrl($part);
        } else {
            $normalized[] = trim($part, '/');
        }
    }

    return implode('/', $normalized);
}
