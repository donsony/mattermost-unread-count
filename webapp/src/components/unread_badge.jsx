import React from 'react';
import { connect } from 'react-redux';

/**
 * UnreadBadge is a React component that displays a badge next to a channel link
 * containing the exact number of unread messages inside that channel.
 * 
 * It automatically updates whenever Redux state changes and respects the active theme.
 */
class UnreadBadge extends React.PureComponent {
    render() {
        const { unreadCount, theme, channel, isMuted } = this.props;

        // Display the badge ONLY next to public ('O' for Open) and private ('P' for Private) channels.
        // We explicitly ignore Direct Messages ('D') and Group Messages ('G') unless required.
        if (!channel || (channel.type !== 'O' && channel.type !== 'P')) {
            return null;
        }

        // If there are no unread messages in the channel, do not render the badge.
        if (unreadCount <= 0) {
            return null;
        }

        // Subdued badge look for muted channels (grayish translucent badge),
        // and highlight look for active channels using active theme colors.
        const badgeBg = isMuted 
            ? 'rgba(128, 128, 128, 0.4)' // Subdued gray with 40% opacity
            : (theme.sidebarTextActiveBorder || '#5c6bc0'); // Uses theme's active border or default slate blue

        const badgeColor = isMuted 
            ? (theme.sidebarText || '#ffffff') // Subdued text color matching sidebar general text
            : (theme.sidebarBg || '#ffffff'); // High contrast text color matching sidebar background

        // Design aesthetics for a premium, custom look matching native mention badges.
        const badgeStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '6px',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '10px',
            backgroundColor: badgeBg,
            color: badgeColor,
            lineHeight: '1',
            minWidth: '16px',
            height: '16px',
            verticalAlign: 'middle',
        };

        return (
            <span 
                style={badgeStyle} 
                className="unread-count-plugin-badge" 
                title={`${unreadCount} unread messages`}
            >
                {unreadCount}
            </span>
        );
    }
}

/**
 * Maps the global Redux state to props for UnreadBadge.
 * Accesses channel information and channel member preferences directly to calculate unreads.
 * 
 * @param {object} state - Global Redux state.
 * @param {object} ownProps - React props passed by the parent component (includes the channel object).
 */
function mapStateToProps(state, ownProps) {
    const channel = ownProps.channel;
    if (!channel || !state.entities || !state.entities.channels) {
        return {
            unreadCount: 0,
            isMuted: false,
        };
    }

    const channelId = channel.id;
    // Get latest channel state (including total message count)
    const channelState = state.entities.channels.channels[channelId];
    // Get latest membership state for the current user (including read message count)
    const member = state.entities.channels.myMembers[channelId];

    let unreadCount = 0;
    let isMuted = false;

    if (channelState && member) {
        const totalMsg = channelState.total_msg_count || 0;
        const msgCount = member.msg_count || 0;
        
        // Unread messages is calculated by subtracting the user's acknowledged read count
        // from the channel's total message count.
        unreadCount = Math.max(0, totalMsg - msgCount);
        
        // A channel is muted if the mark_unread notification preference is set to only mark mentions.
        isMuted = member.notify_props && member.notify_props.mark_unread === 'mention';
    }

    return {
        unreadCount,
        isMuted,
    };
}

// Connect our component to the Redux store to dynamically re-render on state changes.
export default connect(mapStateToProps)(UnreadBadge);
