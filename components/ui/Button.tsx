import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: React.ReactNode;
    variant?: ButtonVariant | string;
    icon?: React.ReactNode;
}

function normalizeLabel(label: React.ReactNode): React.ReactNode {
    if (label === null || label === undefined) {
        return 'Button';
    }

    if (typeof label === 'object' && !React.isValidElement(label)) {
        return JSON.stringify(label);
    }

    return label;
}

function normalizeVariant(variant?: ButtonVariant | string): ButtonVariant {
    return variant === 'secondary' ? 'secondary' : 'primary';
}

export const Button: React.FC<ButtonProps> = ({
    label,
    children,
    variant = 'primary',
    icon,
    style,
    ...props
}) => {
    const safeVariant = normalizeVariant(variant);
    const content = children || normalizeLabel(label);

    const baseStyle: React.CSSProperties = {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: props.disabled ? 0.6 : 1,
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
    };

    return (
        <button
            style={{ ...baseStyle, ...variantStyles[safeVariant], ...style }}
            {...props}
        >
            {icon}
            {content}
        </button>
    );
};