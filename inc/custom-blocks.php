<?php
// inc/custom-blocks/custom-blocks.php
// Include all custom blocks

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Include individual block files
require_once get_stylesheet_directory() . '/inc/mac-curriculam-block.php';
require_once get_stylesheet_directory() . '/inc/mac-pricing-carousel.php';
require_once get_stylesheet_directory() . '/inc/mac-curriculum-product.php';
require_once get_stylesheet_directory() . '/inc/mac-all-curriculum.php';
require_once get_stylesheet_directory() . '/inc/mac-resource-carousel.php';
require_once get_stylesheet_directory() . '/inc/mac-coverflow-carousel.php';
require_once get_stylesheet_directory() . '/inc/mac-community.php';
require_once get_stylesheet_directory() . '/inc/mac-book-card.php';
?>