(function(blocks, element, blockEditor, components) {
    var el = element.createElement;
    var MediaUpload = blockEditor.MediaUpload;
    var MediaPlaceholder = blockEditor.MediaPlaceholder;
    var Button = components.Button;

    blocks.registerBlockType('mac/coverflow-carousel', {
        title: 'Mac Coverflow Carousel',
        icon: 'images-alt2',
        category: 'media',
        attributes: {
            images: { type: 'array', default: [] }
        },
        
        edit: function(props) {
            var images = props.attributes.images || [];

            function onSelectImages(newImages) {
                props.setAttributes({
                    images: newImages.map(function(img) {
                        return { id: img.id, url: img.url };
                    })
                });
            }

            function removeImage(index) {
                var newImages = images.filter(function(img, i) { return i !== index; });
                props.setAttributes({ images: newImages });
            }

            function addMore(newImages) {
                var combined = images.concat(newImages.map(function(img) {
                    return { id: img.id, url: img.url };
                }));
                props.setAttributes({ images: combined });
            }

            if (images.length === 0) {
                return el(MediaPlaceholder, {
                    icon: 'format-gallery',
                    labels: { title: 'Coverflow Carousel' },
                    onSelect: onSelectImages,
                    accept: 'image/*',
                    allowedTypes: ['image'],
                    multiple: true
                });
            }

            return el('div', { className: 'mac-carousel-editor' },
                el('div', { className: 'mac-carousel-images' },
                    images.map(function(image, index) {
                        return el('div', { key: index, className: 'mac-carousel-image' },
                            el('img', { src: image.url }),
                            el(Button, {
                                onClick: function() { removeImage(index); },
                                isDestructive: true,
                                isSmall: true,
                                className: 'remove-btn'
                            }, '×')
                        );
                    })
                ),
                el(MediaUpload, {
                    onSelect: addMore,
                    allowedTypes: ['image'],
                    multiple: true,
                    render: function(obj) {
                        return el(Button, { onClick: obj.open, isPrimary: true }, 'Add More Images');
                    }
                })
            );
        },

        save: function() {
            return null;
        }
    });
})(window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components);