import React from 'react';

interface ModalProps {
    title?: React.ReactNode;
    isOpen?: boolean;
    open?: boolean;
    onClose?: () => void;
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

export const Modal: React.FC<ModalProps> = ({
    title = 'Modal',
    isOpen,
    open,
    onClose,
    children,
    style
}) => {
    const visible = isOpen ?? open ?? false;

    if (!visible) return null;

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    };

    const modalStyle: React.CSSProperties = {
        background: '#1e293b',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        color: 'white',
        ...style
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
    };

    const closeButtonStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '20px',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '20px',
                            lineHeight: 1.3,
                        }}
                    >
                        {normalizeNode(title)}
                    </h2>

                    <button
                        type="button"
                        style={closeButtonStyle}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div>{normalizeNode(children)}</div>
            </div>
        </div>
    );
};