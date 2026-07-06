import React from 'react';

export interface FooterLink {
    label?: React.ReactNode;
    href?: string;
}

export interface FooterColumn {
    title?: React.ReactNode;
    links?: FooterLink[];
}

export interface FooterProps {
    companyName?: React.ReactNode;
    description?: React.ReactNode;
    columns?: FooterColumn[];
    bottomText?: React.ReactNode;
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

export const Footer: React.FC<FooterProps> = ({
    companyName = 'Aether',
    description,
    columns = [],
    bottomText,
    style
}) => {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeCompanyName = normalizeNode(companyName) || 'Aether';

    return (
        <footer
            style={{
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#f8fafc',
                padding: '64px 20px 24px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                ...style
            }}
        >
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '48px',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ flex: '1 1 300px' }}>
                    <h3
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            margin: '0 0 16px 0',
                            color: 'var(--primary)'
                        }}
                    >
                        {safeCompanyName}
                    </h3>

                    {description && (
                        <p
                            style={{
                                color: '#94a3b8',
                                lineHeight: 1.6,
                                maxWidth: '300px'
                            }}
                        >
                            {normalizeNode(description)}
                        </p>
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '48px',
                        flexWrap: 'wrap',
                        flex: '2 1 auto',
                        justifyContent: 'flex-end'
                    }}
                >
                    {safeColumns.length > 0 ? (
                        safeColumns.map((col, idx) => {
                            const links = Array.isArray(col.links) ? col.links : [];

                            return (
                                <div key={idx} style={{ minWidth: '150px' }}>
                                    <h4
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            margin: '0 0 16px 0',
                                            color: '#f8fafc'
                                        }}
                                    >
                                        {normalizeNode(col.title) || `Column ${idx + 1}`}
                                    </h4>

                                    {links.length > 0 ? (
                                        <ul
                                            style={{
                                                listStyle: 'none',
                                                padding: 0,
                                                margin: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            }}
                                        >
                                            {links.map((link, lidx) => (
                                                <li key={lidx}>
                                                    <a
                                                        href={link.href || '#'}
                                                        style={{
                                                            color: '#94a3b8',
                                                            textDecoration: 'none',
                                                            fontSize: '14px',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        {normalizeNode(link.label) || `Link ${lidx + 1}`}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p
                                            style={{
                                                margin: 0,
                                                color: '#64748b',
                                                fontSize: '13px'
                                            }}
                                        >
                                            No links configured.
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p
                            style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '14px'
                            }}
                        >
                            No footer columns configured.
                        </p>
                    )}
                </div>
            </div>

            <div
                style={{
                    maxWidth: '1200px',
                    margin: '48px auto 0 auto',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px'
                }}
            >
                {normalizeNode(bottomText) || `© ${new Date().getFullYear()} ${String(safeCompanyName)}. All rights reserved.`}
            </div>
        </footer>
    );
};