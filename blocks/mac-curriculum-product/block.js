(function(blocks, element, editor, components, i18n) {
    const { registerBlockType } = blocks;
    const { createElement } = element;
    const { InspectorControls } = editor;
    const { PanelBody, TextControl } = components;
    const { __ } = i18n;

    registerBlockType('mac-child/curriculum-products', {
        title: __('MAC Curriculum Products', 'mac-child'),
        description: __('Displays dynamic course products from MAC API based on ?course= parameter', 'mac-child'),
        icon: 'book-alt',
        category: 'widgets',
        keywords: [
            __('curriculum', 'mac-child'),
            __('products', 'mac-child'),
            __('bible stories', 'mac-child'),
            __('course', 'mac-child')
        ],

        attributes: {
            heading: {
                type: 'string',
                default: 'Unlock This Course'
            },
            subheading: {
                type: 'string',
                default: 'You\'ve selected "{title}" to begin learning, please choose the individual product or subscription plan that best fits your goals.'
            }
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { heading, subheading } = attributes;

            return [
                createElement(InspectorControls, {},
                    createElement(PanelBody, {
                        title: __('Block Settings', 'mac-child'),
                        initialOpen: true
                    },
                        createElement(TextControl, {
                            label: __('Main Heading', 'mac-child'),
                            value: heading,
                            onChange: function(value) {
                                setAttributes({ heading: value });
                            }
                        }),
                        createElement(TextControl, {
                            label: __('Sub Heading – use {title} for course name', 'mac-child'),
                            value: subheading,
                            onChange: function(value) {
                                setAttributes({ subheading: value });
                            }
                        })
                    )
                ),

                // Preview in editor
                createElement('div', {
                    className: 'mac-curriculum-products-editor-preview'
                },
                    createElement('div', {
                        className: 'curriculum-preview-header'
                    },
                        createElement('h3', {
                            style: {
                                fontSize: '18px',
                                fontWeight: '600',
                                marginBottom: '10px',
                                color: '#1e1e1e'
                            }
                        }, __('MAC Curriculum Products Block', 'mac-child')),

                        createElement('p', {
                            style: {
                                fontSize: '14px',
                                color: '#555',
                                marginBottom: '12px'
                            }
                        }, __('Heading: ') + heading),

                        createElement('p', {
                            style: {
                                fontSize: '13px',
                                color: '#0073aa',
                                padding: '10px 12px',
                                backgroundColor: '#f0f6fc',
                                border: '1px solid #c3e4f7',
                                borderRadius: '4px'
                            }
                        },
                            __('Dynamic products loaded from API') + ' | ' +
                            __('Based on URL ?course= parameter') + ' | ' +
                            __('Frontend only rendering')
                        )
                    ),

                    createElement('div', {
                        className: 'curriculum-preview-content'
                    },
                        createElement('div', {
                            style: {
                                padding: '40px 24px',
                                border: '2px dashed #ccc',
                                textAlign: 'center',
                                color: '#777',
                                backgroundColor: '#fafafa',
                                borderRadius: '8px',
                                marginTop: '16px'
                            }
                        },
                            createElement('div', {
                                style: {
                                    fontSize: '52px',
                                    marginBottom: '16px'
                                }
                            }, '📚✨'),

                            createElement('p', {
                                style: {
                                    fontSize: '17px',
                                    fontWeight: '500',
                                    marginBottom: '10px',
                                    color: '#333'
                                }
                            }, __('Course Products Grid')),

                            createElement('p', {
                                style: {
                                    fontSize: '14px',
                                    color: '#888'
                                }
                            }, __('This block fetches and displays products on the frontend based on the course parameter in the URL.'))
                        )
                    )
                )
            ];
        },

        save: function() {
            return null; // This is a dynamic block – rendering happens on PHP side
        }
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor || window.wp.editor,
    window.wp.components,
    window.wp.i18n
);