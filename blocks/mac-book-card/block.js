( function ( blocks, element, blockEditor, components, i18n ) {
    var el         = element.createElement;
    var Fragment   = element.Fragment;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody  = components.PanelBody;
    var TextControl = components.TextControl;
    var RangeControl = components.RangeControl;
    var useBlockProps = blockEditor.useBlockProps;
    var __         = i18n.__;

    blocks.registerBlockType( 'mac-theme/book-card', {
        title:       __( 'MAC Book Card Grid', 'mac-theme' ),
        description: __( 'Displays a grid of books fetched from the MAC API.', 'mac-theme' ),
        icon:        'book-alt',
        category:    'widgets',
        attributes: {
            pageSize: { type: 'number', default: 3 },
            search:   { type: 'string', default: '' },
        },

        edit: function ( props ) {
            var attributes  = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps  = useBlockProps();

            return el(
                Fragment,
                null,

                // ── Sidebar controls ────────────────────────────────────────
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: __( 'Book Grid Settings', 'mac-theme' ), initialOpen: true },
                        el( RangeControl, {
                            label:    __( 'Number of Books', 'mac-theme' ),
                            value:    attributes.pageSize,
                            min:      1,
                            max:      12,
                            onChange: function ( val ) { setAttributes( { pageSize: val } ); },
                        } ),
                        el( TextControl, {
                            label:    __( 'Search / Filter', 'mac-theme' ),
                            value:    attributes.search,
                            onChange: function ( val ) { setAttributes( { search: val } ); },
                        } )
                    )
                ),

                // ── Editor preview placeholder ──────────────────────────────
                el(
                    'div',
                    blockProps,
                    el(
                        'div',
                        { style: {
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            padding: '24px',
                            textAlign: 'center',
                            background: '#f9f9f9',
                        } },
                        el( 'span', { style: { fontSize: '32px' } }, '📚' ),
                        el( 'p',    { style: { margin: '8px 0 4px', fontWeight: 600 } },
                            __( 'MAC Book Card Grid', 'mac-theme' )
                        ),
                        el( 'p',    { style: { color: '#666', fontSize: '13px' } },
                            'Shows ' + attributes.pageSize + ' book(s)' +
                            ( attributes.search ? ' matching "' + attributes.search + '"' : '' ) +
                            ' from the MAC API.'
                        )
                    )
                )
            );
        },

        // Server-side rendered — no save needed.
        save: function () { return null; },
    } );

} )(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);
