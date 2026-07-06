import React from 'react';

interface SidebarItem {
    label?: React.ReactNode;
    icon?: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}

interface SidebarProps {
    children?: React.ReactNode;
    items?: SidebarItem[];
    title?: React.ReactNode;
    style?: React.CSSProperties;
}

function normalizeNode(value: React.ReactNode): React.ReactNode {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'object' && !React.isValidElement(value) && !Array.isArray(value)) {
        return JSON.stringify(value);
    }

    return value;
}

export const Sidebar: React.FC<SidebarProps> = ({
    children,
    items = [],
    title,
    style
}) => {
    const safeItems = Array.isArray(items) ? items : [];

    const sidebarStyle: React.CSSProperties = {
        width: '240px',
        minWidth: '240px',
        height: '100%',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '8px',
        boxSizing: 'border-box',
        color: '#f8fafc',
        ...style
    };

    return (
        <aside style={sidebarStyle}>
            {title && (
                <div
                    style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '16px',
                        color: '#ffffff',
                    }}
                >
                    {normalizeNode(title)}
                </div>
            )}

            {safeItems.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}
                >
                    {safeItems.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={item.onClick}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                background: item.active
                                    ? 'rgba(99, 102, 241, 0.18)'
                                    : 'rgba(255, 255, 255, 0.04)',
                                color: item.active ? '#ffffff' : '#cbd5e1',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: item.active ? 700 : 500,
                            }}
                        >
                            {item.icon && <span>{normalizeNode(item.icon)}</span>}
                            <span>{normalizeNode(item.label) || `Item ${index + 1}`}</span>
                        </button>
                    ))}
                </div>
            )}

            {children && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}
                >
                    {normalizeNode(children)}
                </div>
            )}
        </aside>
    );
};