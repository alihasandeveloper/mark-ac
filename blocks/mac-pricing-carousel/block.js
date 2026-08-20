(function(blocks, element, editor, components, data) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = editor.InspectorControls;
    var MediaUpload = editor.MediaUpload;
    var MediaUploadCheck = editor.MediaUploadCheck;
    var PanelBody = components.PanelBody;
    var RangeControl = components.RangeControl;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    var TextControl = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var Button = components.Button;

    registerBlockType('mac/pricing-carousel', {
        title: 'MAC Pricing Carousel',
        icon: 'money-alt',
        category: 'widgets',
        attributes: {
            numberOfPlans: {
                type: 'number',
                default: 3
            },
            autoplay: {
                type: 'boolean',
                default: true
            },
            slidesToShow: {
                type: 'number',
                default: 3
            },
            layout: {
                type: 'string',
                default: 'slider'
            },
            showStaticCard: {
                type: 'boolean',
                default: false
            },
            staticCardTag: {
                type: 'string',
                default: 'Bundle & Save'
            },
            staticCardTitle: {
                type: 'string',
                default: 'How Your Subscription Works'
            },
            staticCardSubtitle: {
                type: 'string',
                default: 'Simple steps to access, choose, and use your monthly resources.'
            },
            staticCardSteps: {
                type: 'array',
                default: [
                    {
                        badgeText: '01',
                        badgeClass: 'purple',
                        title: 'Subscribe & Log In',
                        desc: 'Your subscription gives you access to your resource library.',
                        iconUrl: 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/80060c9c-04c7-47b2-bd7d-daa4dab16d4c.png'
                    },
                    {
                        badgeText: '02',
                        badgeClass: 'orange',
                        title: 'Choose Your Content',
                        desc: 'Each month, log in and choose your 4 new Bible stories, kid services, or Bible Lab lessons.',
                        iconUrl: 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/97804eec-6417-4d9d-ad5c-f2a3f041d877.png'
                    },
                    {
                        badgeText: '03',
                        badgeClass: 'green',
                        title: 'Download & Use',
                        desc: 'Download your resources and use them whenever you\'re ready.',
                        iconUrl: 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/125955e7-329f-4da1-b8e5-11d90327c432.png'
                    }
                ]
            },
            staticCardFooterIcon: {
                type: 'string',
                default: 'https://wp.markandrewscreative.com/wp-content/uploads/2026/08/Background.svg'
            },
            staticCardFooterText: {
                type: 'string',
                default: 'Your subscription includes <span class="highlight-blue">4 new downloads</span> each month. You can choose and download them when you\'re ready!'
            }
        },

        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function onChangeNumberOfPlans(newNumber) {
                setAttributes({ numberOfPlans: parseInt(newNumber) });
            }

            function onChangeAutoplay(newValue) {
                setAttributes({ autoplay: newValue });
            }

            function onChangeSlidesToShow(newNumber) {
                setAttributes({ slidesToShow: parseInt(newNumber) });
            }

            function onChangeLayout(newValue) {
                setAttributes({ layout: newValue });
            }

            return [
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Settings', initialOpen: true },
                        el(SelectControl, {
                            label: 'Layout',
                            value: attributes.layout,
                            options: [
                                { label: 'Slider', value: 'slider' },
                                { label: 'Grid', value: 'grid' }
                            ],
                            onChange: onChangeLayout
                        }),
                        el(RangeControl, {
                            label: 'Number of Plans',
                            value: attributes.numberOfPlans,
                            onChange: onChangeNumberOfPlans,
                            min: 1,
                            max: 6
                        }),
                        attributes.layout === 'slider' ? el(RangeControl, {
                            label: 'Slides to Show',
                            value: attributes.slidesToShow,
                            onChange: onChangeSlidesToShow,
                            min: 1,
                            max: 4
                        }) : null,
                        attributes.layout === 'slider' ? el(ToggleControl, {
                            label: 'Enable Autoplay',
                            checked: attributes.autoplay,
                            onChange: onChangeAutoplay
                        }) : null,
                        el(ToggleControl, {
                            label: 'Show Static Card',
                            checked: attributes.showStaticCard,
                            onChange: function(newValue) {
                                setAttributes({ showStaticCard: newValue });
                            }
                        }),
                        attributes.showStaticCard ? el('div', { style: { borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '15px' } },
                            el('h4', { style: { fontWeight: '600', marginBottom: '10px' } }, 'Static Card Settings'),
                            el(TextControl, {
                                label: 'Associated tag (where to show card)',
                                value: attributes.staticCardTag,
                                onChange: function(newValue) {
                                    setAttributes({ staticCardTag: newValue });
                                }
                            }),
                            el(TextControl, {
                                label: 'Card Title',
                                value: attributes.staticCardTitle,
                                onChange: function(newValue) {
                                    setAttributes({ staticCardTitle: newValue });
                                }
                            }),
                            el(TextControl, {
                                label: 'Card Subtitle',
                                value: attributes.staticCardSubtitle,
                                onChange: function(newValue) {
                                    setAttributes({ staticCardSubtitle: newValue });
                                }
                            }),
                            el('h5', { style: { fontWeight: '600', marginTop: '15px', marginBottom: '10px' } }, 'Steps Repeater'),
                            (attributes.staticCardSteps || []).map(function(step, index) {
                                return el('div', { key: index, style: { border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
                                        el('span', { style: { fontWeight: '600' } }, 'Step ' + (index + 1)),
                                        el(Button, {
                                            isDestructive: true,
                                            isSmall: true,
                                            onClick: function() {
                                                var newSteps = attributes.staticCardSteps.filter(function(_, i) { return i !== index; });
                                                setAttributes({ staticCardSteps: newSteps });
                                            }
                                        }, 'Remove')
                                    ),
                                    el(TextControl, {
                                        label: 'Badge Text',
                                        value: step.badgeText,
                                        onChange: function(val) {
                                            var newSteps = attributes.staticCardSteps.slice();
                                            newSteps[index] = Object.assign({}, step, { badgeText: val });
                                            setAttributes({ staticCardSteps: newSteps });
                                        }
                                    }),
                                    el(SelectControl, {
                                        label: 'Badge Class',
                                        value: step.badgeClass,
                                        options: [
                                            { label: 'Purple', value: 'purple' },
                                            { label: 'Orange', value: 'orange' },
                                            { label: 'Green', value: 'green' }
                                        ],
                                        onChange: function(val) {
                                            var newSteps = attributes.staticCardSteps.slice();
                                            newSteps[index] = Object.assign({}, step, { badgeClass: val });
                                            setAttributes({ staticCardSteps: newSteps });
                                        }
                                    }),
                                    el(TextControl, {
                                        label: 'Title',
                                        value: step.title,
                                        onChange: function(val) {
                                            var newSteps = attributes.staticCardSteps.slice();
                                            newSteps[index] = Object.assign({}, step, { title: val });
                                            setAttributes({ staticCardSteps: newSteps });
                                        }
                                    }),
                                    el(TextareaControl, {
                                        label: 'Description',
                                        value: step.desc,
                                        onChange: function(val) {
                                            var newSteps = attributes.staticCardSteps.slice();
                                            newSteps[index] = Object.assign({}, step, { desc: val });
                                            setAttributes({ staticCardSteps: newSteps });
                                        }
                                    }),
                                    el('div', { style: { marginBottom: '10px' } },
                                        el('label', { style: { display: 'block', marginBottom: '5px', fontSize: '13px' } }, 'Icon Image'),
                                        el(MediaUploadCheck, {},
                                            el(MediaUpload, {
                                                onSelect: function(media) {
                                                    var newSteps = attributes.staticCardSteps.slice();
                                                    newSteps[index] = Object.assign({}, step, { iconUrl: media.url });
                                                    setAttributes({ staticCardSteps: newSteps });
                                                },
                                                allowedTypes: ['image'],
                                                value: step.iconUrl,
                                                render: function(obj) {
                                                    return el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
                                                        step.iconUrl ? el('img', { src: step.iconUrl, style: { width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' } }) : null,
                                                        el(Button, {
                                                            isSecondary: true,
                                                            isSmall: true,
                                                            onClick: obj.open
                                                        }, step.iconUrl ? 'Replace Image' : 'Select Image'),
                                                        step.iconUrl ? el(Button, {
                                                            isDestructive: true,
                                                            isSmall: true,
                                                            onClick: function() {
                                                                var newSteps = attributes.staticCardSteps.slice();
                                                                newSteps[index] = Object.assign({}, step, { iconUrl: '' });
                                                                setAttributes({ staticCardSteps: newSteps });
                                                            }
                                                        }, 'Remove Image') : null
                                                    );
                                                }
                                            })
                                        )
                                    )
                                );
                            }),
                            el(Button, {
                                isSecondary: true,
                                style: { width: '100%', justifyContent: 'center', marginBottom: '15px' },
                                onClick: function() {
                                    var newSteps = (attributes.staticCardSteps || []).concat([{
                                        badgeText: '04',
                                        badgeClass: 'purple',
                                        title: 'New Step',
                                        desc: '',
                                        iconUrl: ''
                                    }]);
                                    setAttributes({ staticCardSteps: newSteps });
                                }
                            }, 'Add Step'),
                            el('h5', { style: { fontWeight: '600', marginTop: '10px', marginBottom: '10px' } }, 'Footer Settings'),
                            el('div', { style: { marginBottom: '15px' } },
                                el('label', { style: { display: 'block', marginBottom: '5px', fontSize: '13px' } }, 'Footer Icon'),
                                el(MediaUploadCheck, {},
                                    el(MediaUpload, {
                                        onSelect: function(media) {
                                            setAttributes({ staticCardFooterIcon: media.url });
                                        },
                                        allowedTypes: ['image'],
                                        value: attributes.staticCardFooterIcon,
                                        render: function(obj) {
                                            return el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
                                                attributes.staticCardFooterIcon ? el('img', { src: attributes.staticCardFooterIcon, style: { width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' } }) : null,
                                                el(Button, {
                                                    isSecondary: true,
                                                    isSmall: true,
                                                    onClick: obj.open
                                                }, attributes.staticCardFooterIcon ? 'Replace Image' : 'Select Image'),
                                                attributes.staticCardFooterIcon ? el(Button, {
                                                    isDestructive: true,
                                                    isSmall: true,
                                                    onClick: function() {
                                                        setAttributes({ staticCardFooterIcon: '' });
                                                    }
                                                }, 'Remove Image') : null
                                            );
                                        }
                                    })
                                )
                            ),
                            el(TextareaControl, {
                                label: 'Footer Text (HTML supported)',
                                value: attributes.staticCardFooterText,
                                onChange: function(newValue) {
                                    setAttributes({ staticCardFooterText: newValue });
                                }
                            })
                        ) : null
                    )
                ),

                // Simple preview like the image
                el('div', {
                        style: {
                            padding: '20px',
                            backgroundColor: '#fff'
                        }
                    },
                    el('h3', {
                        style: {
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '10px',
                            color: '#1e1e1e'
                        }
                    }, 'MAC Pricing Carousel'),

                    el('p', {
                        style: {
                            fontSize: '13px',
                            color: '#757575',
                            marginBottom: '15px'
                        }
                    }, 'Layout: ' + (attributes.layout === 'slider' ? 'Slider' : 'Grid') + ' | Number of plans: ' + attributes.numberOfPlans + (attributes.layout === 'slider' ? ' | Slides to show: ' + attributes.slidesToShow : '')),

                    el('div', {
                            style: {
                                padding: '10px 15px',
                                backgroundColor: '#e7f5fe',
                                border: '1px solid #b3e0f7',
                                borderRadius: '4px',
                                marginBottom: '20px'
                            }
                        },
                        el('span', {
                            style: {
                                fontSize: '13px',
                                color: '#0071a1',
                                marginRight: '10px'
                            }
                        }, '✓ ' + (attributes.layout === 'slider' ? 'Slider mode' : 'Grid mode')),
                        attributes.layout === 'slider' ? el('span', {
                            style: {
                                fontSize: '13px',
                                color: '#0071a1',
                                marginRight: '10px'
                            }
                        }, '✓ Autoplay ' + (attributes.autoplay ? 'enabled' : 'disabled')) : null,
                        el('span', {
                            style: {
                                fontSize: '13px',
                                color: '#0071a1'
                            }
                        }, '✓ Dynamic pricing data')
                    ),

                    el('div', {
                            style: {
                                padding: '60px 24px',
                                border: '2px dashed #ddd',
                                textAlign: 'center',
                                backgroundColor: '#fafafa',
                                borderRadius: '4px'
                            }
                        },
                        el('div', {
                            style: {
                                fontSize: '48px',
                                marginBottom: '15px'
                            }
                        }, '💳'),

                        el('h4', {
                            style: {
                                fontSize: '16px',
                                fontWeight: '500',
                                marginBottom: '8px',
                                color: '#333'
                            }
                        }, 'Pricing Plans ' + (attributes.layout === 'slider' ? 'Carousel' : 'Grid')),

                        el('p', {
                            style: {
                                fontSize: '13px',
                                color: '#757575',
                                lineHeight: '1.5'
                            }
                        }, 'This block will display pricing plans in ' + (attributes.layout === 'slider' ? 'slider' : 'grid') + ' layout on the frontend')
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
    window.wp.blockEditor,
    window.wp.components,
    window.wp.data
);