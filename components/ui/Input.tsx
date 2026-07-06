import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    error?: React.ReactNode;
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

export const Input: React.FC<InputProps> = ({
    label,
    error,
    style,
    onFocus,
    onBlur,
    type = 'text',
    placeholder = 'Enter value...',
    ...props
}) => {
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: error
            ? '1px solid rgba(248, 113, 113, 0.7)'
            : '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style
    };

    return (
        <label
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
            }}
        >
            {label && (
                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#cbd5e1',
                    }}
                >
                    {normalizeNode(label)}
                </span>
            )}

            <input
                type={type}
                placeholder={placeholder}
                style={inputStyle}
                {...props}
                onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    e.currentTarget.style.border = error
                        ? '1px solid rgba(248, 113, 113, 0.7)'
                        : '1px solid rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    onBlur?.(e);
                }}
            />

            {error && (
                <span
                    style={{
                        fontSize: '12px',
                        color: '#f87171',
                    }}
                >
                    {normalizeNode(error)}
                </span>
            )}
        </label>
    );
};