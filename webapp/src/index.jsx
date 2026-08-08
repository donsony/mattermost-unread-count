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

        // Set up the desktop app / browser title unread count synchronization.
        this.setupTitleUnreadSync(store);
    }

    /**
     * Set up synchronization between the total unread count and the document.title.
     * The Electron desktop client reads the document.title and parses the unread count
     * in parentheses (e.g., "(5)") to update the app taskbar/dock icon badge count.
     * 
     * @param {object} store - The Redux store.
     */
    setupTitleUnreadSync(store) {
        // Store the original document.title property descriptor to prevent recursion and allow cleanup.
        const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
        if (!descriptor || !descriptor.set || !descriptor.get) {
            return;
        }

        let currentTotalUnreads = 0;

        /**
         * Formats the document title to include the unread count in parentheses.
         * Strips existing unread counts (e.g., "(5) * " or "* ") from the title first.
         * 
         * @param {string} title - The original window title.
         * @param {number} count - The total unread message count.
         * @returns {string} The formatted window title.
         */
        const formatTitle = (title, count) => {
            const cleanTitle = title.replace(/^\(\d+\)\s*(?:\*\s*)?/, '').replace(/^\*\s*/, '');
            if (count > 0) {
                return `(${count}) * ${cleanTitle}`;
            }
            return cleanTitle;
        };

        // Redefine document.title setter/getter to intercept all title changes made by the webapp.
        Object.defineProperty(document, 'title', {
            get: () => {
                return descriptor.get.call(document);
            },
            set: (val) => {
                const modifiedVal = formatTitle(val, currentTotalUnreads);
                descriptor.set.call(document, modifiedVal);
            },
            configurable: true,
            enumerable: true
        });

        /**
         * Calculates the total unread message count across all channels (public, private, DMs, GMs)
         * and updates the document title if the total unread count has changed.
         */
        const updateUnreads = () => {
            const state = store.getState();
            if (!state || !state.entities || !state.entities.channels) {
                return;
            }

            const channels = state.entities.channels.channels || {};
            const myMembers = state.entities.channels.myMembers || {};

            let totalUnreads = 0;
            Object.keys(channels).forEach((channelId) => {
                const channel = channels[channelId];
                const member = myMembers[channelId];
                if (channel && member) {
                    // Sum unread messages across all relevant channel types
                    if (channel.type === 'O' || channel.type === 'P' || channel.type === 'D' || channel.type === 'G') {
                        const totalMsg = channel.total_msg_count || 0;
                        const msgCount = member.msg_count || 0;
                        totalUnreads += Math.max(0, totalMsg - msgCount);
                    }
                }
            });

            if (totalUnreads !== currentTotalUnreads) {
                currentTotalUnreads = totalUnreads;
                // Trigger the setter to update the document title immediately
                const currentTitle = document.title;
                document.title = currentTitle;
            }
        };

        // Run calculation initially
        updateUnreads();

        // Subscribe to store updates to dynamically adjust the count as messages are received/read
        this.unsubscribeStore = store.subscribe(() => {
            updateUnreads();
        });
    }

    /**
     * uninitialize is called when the plugin is deactivated or uninstalled.
     * Cleans up the Redux subscription and restores the original document.title descriptor.
     */
    uninitialize() {
        if (this.unsubscribeStore) {
            this.unsubscribeStore();
        }

        // Restore original document.title property descriptor to clean up the environment
        const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
        if (descriptor) {
            Object.defineProperty(document, 'title', {
                get: function() {
                    return descriptor.get.call(document);
                },
                set: function(val) {
                    descriptor.set.call(document, val);
                },
                configurable: true,
                enumerable: true
            });
            
            // Revert the document title back to its clean form
            const cleanTitle = document.title.replace(/^\(\d+\)\s*(?:\*\s*)?/, '').replace(/^\*\s*/, '');
            document.title = cleanTitle;
        }
    }
}

// Register the plugin with the global window context.
// The first parameter must match the unique ID defined in `plugin.json` ("com.github.donso.unread-count-plugin").
window.registerPlugin('com.github.donso.unread-count-plugin', new UnreadCountPlugin());
