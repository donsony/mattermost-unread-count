import React from 'react';
import { connect } from 'react-redux';

class UnreadBadge extends React.PureComponent {
    render() {
        const { unreadCount, theme, channel, isMuted } = this.props;

        // Only display next to public (O) and private (P) channels
        if (!channel || (channel.type !== 'O' && channel.type !== 'P')) {
            return null;
        }

        if (unreadCount <= 0) {
            return null;
        }

        // Subdued badge for muted channels, highlight badge for active ones
        const badgeBg = isMuted 
            ? 'rgba(128, 128, 128, 0.4)' // Subdued gray
            : (theme.sidebarTextActiveBorder || '#5c6bc0'); // Accent highlight color

        const badgeColor = isMuted 
            ? (theme.sidebarText || '#ffffff') 
            : (theme.sidebarBg || '#ffffff');

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
            <span style={badgeStyle} className="unread-count-plugin-badge" title={`${unreadCount} unread messages`}>
                {unreadCount}
            </span>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const channel = ownProps.channel;
    if (!channel || !state.entities || !state.entities.channels) {
        return {
            unreadCount: 0,
            isMuted: false,
        };
    }

    const channelId = channel.id;
    const channelState = state.entities.channels.channels[channelId];
    const member = state.entities.channels.myMembers[channelId];

    let unreadCount = 0;
    let isMuted = false;

    if (channelState && member) {
        const totalMsg = channelState.total_msg_count || 0;
        const msgCount = member.msg_count || 0;
        unreadCount = Math.max(0, totalMsg - msgCount);
        isMuted = member.notify_props && member.notify_props.mark_unread === 'mention';
    }

    return {
        unreadCount,
        isMuted,
    };
}

export default connect(mapStateToProps)(UnreadBadge);
