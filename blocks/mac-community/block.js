(function(blocks, element, editor, components, i18n) {
    const { registerBlockType } = blocks;
    const { createElement } = element;
    const { __ } = i18n;
    
    registerBlockType('mac-theme/community-block', {
        title: __('MAC Community Block', 'mac-theme'),
        description: __('Allows users to submit community posts.', 'mac-theme'),
        icon: 'groups',
        category: 'widgets',
        keywords: [
            __('community', 'mac-theme'),
            __('post', 'mac-theme'),
            __('submit', 'mac-theme')
        ],
        
        edit: function(props) {
            return createElement('div', {
                style: {
                    padding: '20px',
                    border: '2px dashed #0073aa',
                    backgroundColor: '#f0f6fc',
                    textAlign: 'center',
                    borderRadius: '8px'
                }
            },
                createElement('h3', {
                    style: { margin: '0 0 10px 0' }
                }, __('Community Post Form', 'mac-theme')),
                createElement('p', {
                    style: { margin: '0', color: '#666' }
                }, __('Form with input and button will appear on the frontend.', 'mac-theme'))
            );
        },
        
        save: function() {
            // Dynamic block, rendering handled by PHP
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
