(function(blocks, element, editor, components, i18n) {
    const { registerBlockType } = blocks;
    const { createElement } = element;
    const { InspectorControls } = editor;
    const { PanelBody, RangeControl, SelectControl } = components;
    const { __ } = i18n;
    
    registerBlockType('mac-theme/curriculum-block', {
        title: __('MAC Curriculum Block', 'mac-theme'),
        description: __('Display curriculum posts with filters and search functionality.', 'mac-theme'),
        icon: 'book-alt',
        category: 'widgets',
        keywords: [
            __('curriculum', 'mac-theme'),
            __('course', 'mac-theme'),
            __('filter', 'mac-theme')
        ],
        attributes: {
            postsPerPage: {
                type: 'number',
                default: 9
            },
            layout: {
                type: 'string',
                default: 'grid'
            }
        },
        
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { postsPerPage, layout } = attributes;
            
            return [
                createElement(InspectorControls, {},
                    createElement(PanelBody, { 
                        title: __('Curriculum Settings', 'mac-theme'), 
                        initialOpen: true 
                    },
                        createElement(SelectControl, {
                            label: __('Layout', 'mac-theme'),
                            value: layout,
                            options: [
                                { label: __('Grid', 'mac-theme'), value: 'grid' },
                                { label: __('Slider', 'mac-theme'), value: 'slider' }
                            ],
                            onChange: function(value) {
                                setAttributes({ layout: value });
                            }
                        }),
                        createElement(RangeControl, {
                            label: __('Posts Per Page', 'mac-theme'),
                            value: postsPerPage,
                            onChange: function(value) {
                                setAttributes({ postsPerPage: value });
                            },
                            min: 3,
                            max: 30,
                            step: 3
                        })
                    )
                ),
                createElement('div', {
                    className: 'mac-curriculum-block-editor-preview'
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
                        }, __('MAC Curriculum Block', 'mac-theme')),
                        createElement('p', {
                            style: { 
                                fontSize: '14px', 
                                color: '#666', 
                                marginBottom: '15px' 
                            }
                        }, __('Layout: ' + (layout === 'slider' ? 'Slider' : 'Grid'), 'mac-theme') + ' | ' + __('Posts per page: ' + postsPerPage, 'mac-theme')),
                        createElement('div', {
                            style: { 
                                fontSize: '13px', 
                                color: '#0073aa', 
                                padding: '12px',
                                backgroundColor: '#f0f6fc',
                                border: '1px solid #c3e4f7',
                                borderRadius: '4px',
                                marginTop: '10px'
                            }
                        }, __('✓ Search functionality enabled', 'mac-theme') + ' | ' + __('✓ Category filters enabled', 'mac-theme'))
                    ),
                    createElement('div', {
                        className: 'curriculum-preview-content'
                    },
                        createElement('div', {
                            style: {
                                padding: '40px 20px',
                                border: '2px dashed #ddd',
                                textAlign: 'center',
                                color: '#666',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                marginTop: '15px'
                            }
                        },
                            createElement('div', {
                                style: {
                                    fontSize: '48px',
                                    marginBottom: '15px'
                                }
                            }, '📚'),
                            createElement('p', {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }
                            }, layout === 'slider'
                                ? __('Curriculum Slider with Filters (3 cards per view)', 'mac-theme')
                                : __('Curriculum Grid with Filters', 'mac-theme')),
                            createElement('p', {
                                style: {
                                    fontSize: '14px',
                                    color: '#999'
                                }
                            }, __('This block will display curriculum posts with search and category filters on the frontend', 'mac-theme'))
                        )
                    )
                )
            ];
        },
        
        save: function() {
            // Server-side rendering, so return null
            return null;
        }
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor || window.wp.editor,
    window.wp.components,
    window.wp.i18n
);