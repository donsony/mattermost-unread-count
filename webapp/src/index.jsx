import React from 'react';
import UnreadBadge from './components/unread_badge';

/**
 * UnreadCountPlugin implements the Mattermost client-side plugin lifecycle.
 * It registers a custom React component to render next to channel names in the sidebar,
 * providing users with the exact count of unread messages for each channel.
 */
class UnreadCountPlugin {
    /**
     * initialize is called by the Mattermost webapp when loading the plugin.
     * 
     * @param {object} registry - The Web App registry used to inject custom components and extend the UI.
     * @param {object} store - The Redux store containing the current user state, preferences, and channel info.
     */
    initialize(registry, store) {
        // Verify if the active Mattermost webapp supports the custom sidebar channel link label hook.
        // This hook allows injecting custom React components into each channel item in the left sidebar.
        if (registry.registerSidebarChannelLinkLabelComponent) {
            // Register our UnreadBadge component. Mattermost will render this next to the channel text label.
            registry.registerSidebarChannelLinkLabelComponent(UnreadBadge);
        } else {
            console.error('registerSidebarChannelLinkLabelComponent is not supported on this Mattermost version.');
        }
    }

    /**
     * uninitialize is called when the plugin is deactivated or uninstalled.
     * Used to clean up any registered resources, hooks, or event listeners.
     */
    uninitialize() {
        // No-op - Mattermost automatically unregisters components loaded via the registry.
    }
}

// Register the plugin with the global window context.
// The first parameter must match the unique ID defined in `plugin.json` ("com.github.donso.unread-count-plugin").
window.registerPlugin('com.github.donso.unread-count-plugin', new UnreadCountPlugin());
