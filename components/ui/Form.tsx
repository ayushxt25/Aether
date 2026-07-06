import React from 'react';
import { Button } from './Button';
import { Input } from './Input';

export interface FormField {
    id?: string;
    name?: string;
    label?: React.ReactNode;
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | string;
    placeholder?: string;
    required?: boolean;
}

export interface FormProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    fields?: FormField[];
    submitLabel?: React.ReactNode;
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

function normalizeInputType(type?: string): React.HTMLInputTypeAttribute {
    const validTypes = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'];

    if (type && validTypes.includes(type)) {
        return type as React.HTMLInputTypeAttribute;
    }

    return 'text';
}

export const Form: React.FC<FormProps> = ({
    title,
    description,
    fields = [],
    submitLabel = 'Submit',
    style
}) => {
    const safeFields = Array.isArray(fields) ? fields : [];

    return (
        <form
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: '500px',
                width: '100%',
                color: '#f8fafc',
                ...style
            }}
            onSubmit={(e) => e.preventDefault()}
        >
            {title && (
                <h3 style={{ margin: 0, fontSize: '24px' }}>
                    {normalizeNode(title)}
                </h3>
            )}

            {description && (
                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: 1.6,
                    }}
                >
                    {normalizeNode(description)}
                </p>
            )}

            {safeFields.length > 0 ? (
                safeFields.map((field, index) => {
                    const id = field.id || field.name || `field-${index}`;
                    const label = normalizeNode(field.label || id);
                    const isTextarea = field.type === 'textarea';

                    return (
                        <div
                            key={id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {isTextarea ? (
                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        width: '100%',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#cbd5e1',
                                        }}
                                    >
                                        {label} {field.required && <span style={{ color: '#f87171' }}>*</span>}
                                    </span>

                                    <textarea
                                        id={id}
                                        placeholder={field.placeholder || ''}
                                        required={field.required}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            minHeight: '100px',
                                            resize: 'vertical',
                                            outline: 'none',
                                        }}
                                    />
                                </label>
                            ) : (
                                <Input
                                    id={id}
                                    label={
                                        <>
                                            {label} {field.required && <span style={{ color: '#f87171' }}>*</span>}
                                        </>
                                    }
                                    type={normalizeInputType(field.type)}
                                    placeholder={field.placeholder || ''}
                                    required={field.required}
                                />
                            )}
                        </div>
                    );
                })
            ) : (
                <p
                    style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#64748b',
                    }}
                >
                    No form fields configured.
                </p>
            )}

            <Button
                label={normalizeNode(submitLabel) || 'Submit'}
                variant="primary"
                style={{ marginTop: '16px' }}
            />
        </form>
    );
};