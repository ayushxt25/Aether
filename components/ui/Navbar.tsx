import React from 'react';
import { Button } from './Button';

interface NavLink {
    label?: React.ReactNode;
    href?: string;
}

interface NavAction {
    label?: React.ReactNode;
    variant?: 'primary' | 'secondary' | string;
    onClick?: () => void;
}

interface NavbarProps {
    title?: React.ReactNode;
    logo?: React.ReactNode;
    links?: Array<string | NavLink>;
    actions?: NavAction[];
    children?: React.ReactNode;
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

function normalizeLink(link: string | NavLink): NavLink {
    if (typeof link === 'string') {
        return {
            label: link,
            href: '#',
        };
    }

    return {
        label: normalizeNode(link.label) || 'Link',
        href: link.href || '#',
    };
}

export const Navbar: React.FC<NavbarProps> = ({
    title,
    logo,
    links = [],
    actions = [],
    children,
    style
}) => {
    const safeTitle = normalizeNode(title || logo || 'Aether');

    const navStyle: React.CSSProperties = {
        minHeight: '64px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        padding: '0 24px',
        boxSizing: 'border-box',
        ...style
    };

    return (
        <nav style={navStyle}>
            <h1
                style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'white',
                    margin: 0,
                    whiteSpace: 'nowrap',
                }}
            >
                {safeTitle}
            </h1>

            {links.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center',
                        minWidth: 0,
                        overflowX: 'auto',
                    }}
                >
                    {links.map((link, index) => {
                        const safeLink = normalizeLink(link);

                        return (
                            <a
                                key={index}
                                href={safeLink.href}
                                style={{
                                    color: '#cbd5e1',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {normalizeNode(safeLink.label)}
                            </a>
                        );
                    })}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                {children}

                {actions.map((action, index) => (
                    <Button
                        key={index}
                        label={normalizeNode(action.label) || 'Action'}
                        variant={action.variant}
                        onClick={action.onClick}
                    />
                ))}
            </div>
        </nav>
    );
};