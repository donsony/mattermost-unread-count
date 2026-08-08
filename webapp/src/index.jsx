import React from 'react';
import UnreadBadge from './components/unread_badge';

class UnreadCountPlugin {
    initialize(registry, store) {
        if (registry.registerSidebarChannelLinkLabelComponent) {
            registry.registerSidebarChannelLinkLabelComponent(UnreadBadge);
        } else {
            console.error('registerSidebarChannelLinkLabelComponent is not supported on this Mattermost version.');
        }
    }

    uninitialize() {
        // No-op
    }
}

// Register the plugin with the unique ID defined in plugin.json
window.registerPlugin('com.github.donso.unread-count-plugin', new UnreadCountPlugin());
