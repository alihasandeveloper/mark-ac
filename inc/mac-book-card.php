<?php
/**
 * Register and render MAC Book Card Block
 * Fetches books from the public API and renders a grid of book cards.
 */

// ─── Block Registration ───────────────────────────────────────────────────────

function mac_register_book_card_block()
{
    // Editor block script (Gutenberg sidebar)
    wp_register_script(
        'mac-book-card-block-script',
        get_stylesheet_directory_uri() . '/blocks/mac-book-card/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        filemtime(get_stylesheet_directory() . '/blocks/mac-book-card/block.js')
    );

    // Frontend script (runs on the public page)
    wp_register_script(
        'mac-book-card-frontend',
        get_stylesheet_directory_uri() . '/blocks/mac-book-card/frontend.js',
        array(),
        filemtime(get_stylesheet_directory() . '/blocks/mac-book-card/frontend.js'),
        true
    );

    // Block stylesheet (editor + frontend)
    // wp_register_style(
    //     'mac-book-card-style',
    //     get_stylesheet_directory_uri() . '/blocks/mac-book-card/style.css',
    //     array(),
    //     filemtime(get_stylesheet_directory() . '/blocks/mac-book-card/style.css')
    // );

    register_block_type('mac-theme/book-card', array(
        'editor_script' => 'mac-book-card-block-script',
        'script' => 'mac-book-card-frontend',
        // 'style' => 'mac-book-card-style',
        'render_callback' => 'mac_render_book_card_block',
        'attributes' => array(
            'pageSize' => array(
                'type' => 'number',
                'default' => 3,
            ),
            'search' => array(
                'type' => 'string',
                'default' => '',
            ),
        ),
    ));
}
add_action('init', 'mac_register_book_card_block');

// ─── Render Callback ──────────────────────────────────────────────────────────

function mac_render_book_card_block($attributes)
{
    $page_size = isset($attributes['pageSize']) ? intval($attributes['pageSize']) : 3;
    $search = isset($attributes['search']) ? sanitize_text_field($attributes['search']) : '';

    $api_url = add_query_arg(
        array(
            'page' => 1,
            'page_size' => $page_size,
            'search' => $search,
        ),
        BASE_API . '/books/public/'
    );

    $response = wp_remote_get($api_url, array(
        'timeout' => 10,
        'headers' => array('Accept' => 'application/json'),
    ));

    $books = array();

    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($body['results']) && is_array($body['results'])) {
            $books = $body['results'];
        }
    }

    // wp_enqueue_style('mac-book-card-style');

    ob_start();
    ?>
    <div class="mac-books-grid">

        <?php if (!empty($books)): ?>
            <a href="/books" class="see-all">
                See all
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z"
                        fill="#1C274C"></path>
                </svg>
            </a>
            <?php foreach ($books as $book):
                $title = !empty($book['title']) ? esc_html($book['title']) : '';
                $slug = !empty($book['slug']) ? esc_attr($book['slug']) : '';
                $author = !empty($book['author']) ? esc_html($book['author']) : '';
                $image = !empty($book['image']) ? esc_url($book['image']) : '';

                $href = '/books?selected=' . $slug;
                ?>
                <a class="mac-book-card" href="<?php echo esc_url($href); ?>">
                    <?php if ($image): ?>
                        <img src="<?php echo $image; ?>" alt="<?php echo $title; ?>" loading="lazy" />
                    <?php endif; ?>
                    <div class="mac-book-overlay">
                        <h5><?php echo $title; ?></h5>
                        <?php if ($author): ?>
                            <div class="mac-book-author">Author: <?php echo $author; ?></div>
                        <?php endif; ?>
                    </div>
                </a>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="mac-books-empty">No books found.</p>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}
