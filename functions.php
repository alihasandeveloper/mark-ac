<?php
/**
 * Recommended way to include parent theme styles.
 * (Please see http://codex.wordpress.org/Child_Themes#How_to_Create_a_Child_Theme)
 *
 */

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
		'main-script',
		get_stylesheet_directory_uri() . '/assets/js/main.js',
		array(),
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

	wp_enqueue_script(
		'swiper-js',
		get_stylesheet_directory_uri() . '/assets/js/swiper/swiper-bundle.min.js',
		array(),
		'12.0.3',
		true
	);

	// Localize script with AJAX URL
	wp_localize_script('main-script', 'macCurriculumAjax', array(
		'ajaxurl' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('mac_curriculum_nonce')
	));

}

/**
 * Your code goes below.
 */
require_once get_stylesheet_directory() . '/inc/custom-blocks.php';

