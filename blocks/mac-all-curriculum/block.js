(function(blocks, element, editor, components, i18n) {
    const { registerBlockType } = blocks;
    const { createElement } = element;
    const { InspectorControls } = editor;
    const { PanelBody, RangeControl } = components;
    const { __ } = i18n;
    
    registerBlockType('mac-theme/all-courses-block', {
        title: __('MAC All Courses Block', 'mac-theme'),
        description: __('Display all courses with pagination based on URL parameter.', 'mac-theme'),
        icon: 'grid-view',
        category: 'widgets',
        keywords: [
            __('courses', 'mac-theme'),
            __('all courses', 'mac-theme'),
            __('pagination', 'mac-theme')
        ],
        attributes: {
            perPage: {
                type: 'number',
                default: 12
            }
        },
        
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { perPage } = attributes;
            
            return [
                createElement(InspectorControls, {},
                    createElement(PanelBody, { 
                        title: __('Courses Settings', 'mac-theme'), 
                        initialOpen: true 
                    },
                        createElement(RangeControl, {
                            label: __('Courses Per Page', 'mac-theme'),
                            value: perPage,
                            onChange: function(value) {
                                setAttributes({ perPage: value });
                            },
                            min: 6,
                            max: 24,
                            step: 6
                        })
                    )
                ),
                createElement('div', {
                    className: 'mac-all-courses-block-editor-preview'
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
                        }, __('MAC All Courses Block', 'mac-theme')),
                        createElement('p', {
                            style: { 
                                fontSize: '14px', 
                                color: '#666', 
                                marginBottom: '15px' 
                            }
                        }, __('Courses per page: ' + perPage, 'mac-theme')),
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
                        }, __('? Pagination enabled', 'mac-theme') + ' | ' + __('? URL parameter based', 'mac-theme'))
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
                            }, '??'),
                            createElement('p', {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }
                            }, __('All Courses Grid with Pagination', 'mac-theme')),
                            createElement('p', {
                                style: {
                                    fontSize: '14px',
                                    color: '#999'
                                }
                            }, __('This block displays courses based on ?course= URL parameter', 'mac-theme'))
                        )
                    )
                )
            ];
        },
        
        save: function() {
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