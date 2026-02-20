(function(blocks, element, editor, components, data) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = editor.InspectorControls;
    var PanelBody = components.PanelBody;
    var RangeControl = components.RangeControl;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;

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
                        }) : null
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