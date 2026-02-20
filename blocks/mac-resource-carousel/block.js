(function(blocks, element, blockEditor, components, i18n) {
    const el = element.createElement;
    const { registerBlockType } = blocks;
    const { InspectorControls } = blockEditor;
    const { PanelBody, Button, TextControl, IconButton } = components;
    const { __ } = i18n;
    const { MediaUpload, MediaUploadCheck } = blockEditor;

    registerBlockType('mac/resource-carousel', {
        title: __('Mac Resource Carousel', 'mac'),
        icon: 'images-alt2',
        category: 'common',
        attributes: {
            slides: {
                type: 'array',
                default: []
            }
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { slides } = attributes;

            function addSlide() {
                const newSlides = [...slides];
                newSlides.push({
                    imageUrl: '',
                    imageId: null,
                    linkText: '',
                    linkUrl: ''
                });
                setAttributes({ slides: newSlides });
            }

            function removeSlide(index) {
                const newSlides = slides.filter((item, i) => i !== index);
                setAttributes({ slides: newSlides });
            }

            function updateSlide(index, field, value) {
                const newSlides = [...slides];
                newSlides[index][field] = value;
                setAttributes({ slides: newSlides });
            }

            function moveSlideUp(index) {
                if (index === 0) return;
                const newSlides = [...slides];
                [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
                setAttributes({ slides: newSlides });
            }

            function moveSlideDown(index) {
                if (index === slides.length - 1) return;
                const newSlides = [...slides];
                [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
                setAttributes({ slides: newSlides });
            }

            return [
                el(InspectorControls, {},
                    el(PanelBody, { 
                        title: __('Carousel Slides', 'mac'),
                        initialOpen: true 
                    },
                        slides.map(function(slide, index) {
                            return el('div', {
                                key: index,
                                style: {
                                    marginBottom: '20px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f9f9f9'
                                }
                            },
                                el('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px'
                                    }
                                },
                                    el('strong', {}, __('Slide', 'mac') + ' ' + (index + 1)),
                                    el('div', {},
                                        el(Button, {
                                            isSmall: true,
                                            onClick: function() { moveSlideUp(index); },
                                            disabled: index === 0,
                                            icon: 'arrow-up-alt2'
                                        }),
                                        el(Button, {
                                            isSmall: true,
                                            onClick: function() { moveSlideDown(index); },
                                            disabled: index === slides.length - 1,
                                            icon: 'arrow-down-alt2',
                                            style: { marginLeft: '5px' }
                                        }),
                                        el(Button, {
                                            isSmall: true,
                                            isDestructive: true,
                                            onClick: function() { removeSlide(index); },
                                            icon: 'trash',
                                            style: { marginLeft: '5px' }
                                        })
                                    )
                                ),
                                
                                el(MediaUploadCheck, {},
                                    el(MediaUpload, {
                                        onSelect: function(media) {
                                            updateSlide(index, 'imageUrl', media.url);
                                            updateSlide(index, 'imageId', media.id);
                                        },
                                        allowedTypes: ['image'],
                                        value: slide.imageId,
                                        render: function(obj) {
                                            return el('div', { style: { marginBottom: '10px' } },
                                                slide.imageUrl ?
                                                    el('div', {},
                                                        el('img', {
                                                            src: slide.imageUrl,
                                                            style: {
                                                                width: '100%',
                                                                height: 'auto',
                                                                marginBottom: '10px',
                                                                borderRadius: '4px'
                                                            }
                                                        }),
                                                        el(Button, {
                                                            onClick: obj.open,
                                                            isSecondary: true,
                                                            style: { marginRight: '5px' }
                                                        }, __('Change Image', 'mac')),
                                                        el(Button, {
                                                            onClick: function() {
                                                                updateSlide(index, 'imageUrl', '');
                                                                updateSlide(index, 'imageId', null);
                                                            },
                                                            isDestructive: true
                                                        }, __('Remove Image', 'mac'))
                                                    ) :
                                                    el(Button, {
                                                        onClick: obj.open,
                                                        isPrimary: true
                                                    }, __('Select Image', 'mac'))
                                            );
                                        }
                                    })
                                ),

                                el(TextControl, {
                                    label: __('Link Text', 'mac'),
                                    value: slide.linkText,
                                    onChange: function(value) {
                                        updateSlide(index, 'linkText', value);
                                    },
                                    placeholder: __('Enter button text', 'mac')
                                }),

                                el(TextControl, {
                                    label: __('Link URL', 'mac'),
                                    value: slide.linkUrl,
                                    onChange: function(value) {
                                        updateSlide(index, 'linkUrl', value);
                                    },
                                    placeholder: __('https://example.com', 'mac')
                                })
                            );
                        }),

                        el(Button, {
                            isPrimary: true,
                            onClick: addSlide,
                            style: { marginTop: '10px' }
                        }, __('Add Slide', 'mac'))
                    )
                ),

                el('div', {
                    className: 'mac-resource-carousel-editor',
                    style: {
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f0f0f0',
                        border: '2px dashed #ccc',
                        borderRadius: '8px'
                    }
                },
                    el('p', { style: { margin: 0, fontSize: '16px', color: '#555' } },
                        slides.length > 0 
                            ? __('Mac Resource Carousel - ' + slides.length + ' slide(s) configured', 'mac')
                            : __('Mac Resource Carousel - Add slides in the sidebar', 'mac')
                    ),
                    el('p', { style: { margin: '10px 0 0', fontSize: '14px', color: '#888' } },
                        __('Preview available on the frontend', 'mac')
                    )
                )
            ];
        },

        save: function() {
            return null; // Dynamic block, rendered via PHP
        }
    });

}(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
));