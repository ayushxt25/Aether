import React from 'react';

interface CardProps {
    title?: React.ReactNode;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    image?: string;
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

export const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    description,
    image,
    children,
    style
}) => {
    const safeTitle = normalizeNode(title);
    const safeSubtitle = normalizeNode(subtitle);
    const safeDescription = normalizeNode(description);

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '18px',
        fontWeight: 700,
        margin: 0,
        color: '#fff',
    };

    const subtitleStyle: React.CSSProperties = {
        fontSize: '13px',
        margin: 0,
        color: '#94a3b8',
        lineHeight: 1.5,
    };

    return (
        <div style={cardStyle}>
            {image && (
                <div
                    style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: '10px',
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                />
            )}

            {(safeTitle || safeSubtitle || safeDescription) && (
                <div
                    style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                    }}
                >
                    {safeTitle && <h3 style={titleStyle}>{safeTitle}</h3>}
                    {safeSubtitle && <p style={subtitleStyle}>{safeSubtitle}</p>}
                    {safeDescription && <p style={subtitleStyle}>{safeDescription}</p>}
                </div>
            )}

            {children && <div style={{ flex: 1 }}>{normalizeNode(children)}</div>}
        </div>
    );
};