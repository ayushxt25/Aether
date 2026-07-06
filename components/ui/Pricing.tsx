import React from 'react';
import { Button } from './Button';
import { Card } from './Card';

export interface PricingTier {
    name?: React.ReactNode;
    title?: React.ReactNode;
    price?: React.ReactNode;
    description?: React.ReactNode;
    features?: React.ReactNode[];
    isPopular?: boolean;
    popular?: boolean;
    ctaLabel?: React.ReactNode;
}

export interface PricingProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    tiers?: PricingTier[];
    plans?: PricingTier[];
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

export const Pricing: React.FC<PricingProps> = ({
    title = 'Simple, transparent pricing',
    subtitle,
    tiers,
    plans,
    style
}) => {
    const safeTiers = Array.isArray(tiers) && tiers.length > 0
        ? tiers
        : Array.isArray(plans)
            ? plans
            : [];

    return (
        <div
            style={{
                padding: '64px 20px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.35)',
                borderRadius: '16px',
                ...style
            }}
        >
            <h2
                style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#f8fafc'
                }}
            >
                {normalizeNode(title)}
            </h2>

            {subtitle && (
                <p
                    style={{
                        fontSize: '18px',
                        color: '#94a3b8',
                        marginBottom: '48px'
                    }}
                >
                    {normalizeNode(subtitle)}
                </p>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: '24px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                {safeTiers.length > 0 ? (
                    safeTiers.map((tier, index) => {
                        const isPopular = Boolean(tier.isPopular ?? tier.popular);
                        const tierTitle = normalizeNode(tier.name || tier.title || `Plan ${index + 1}`);
                        const features = Array.isArray(tier.features) ? tier.features : [];

                        return (
                            <div
                                key={index}
                                style={{
                                    flex: '1 1 300px',
                                    maxWidth: '350px',
                                    transform: isPopular ? 'scale(1.03)' : 'none',
                                    position: 'relative',
                                    zIndex: isPopular ? 10 : 1
                                }}
                            >
                                {isPopular && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'var(--primary)',
                                            color: '#fff',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        Most Popular
                                    </div>
                                )}

                                <Card title={tierTitle}>
                                    <div
                                        style={{
                                            paddingBottom: '24px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            marginBottom: '24px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '42px',
                                                fontWeight: 'bold',
                                                color: '#f8fafc'
                                            }}
                                        >
                                            {normalizeNode(tier.price) || 'Custom'}
                                        </div>

                                        {tier.description && (
                                            <div
                                                style={{
                                                    color: '#94a3b8',
                                                    fontSize: '14px',
                                                    marginTop: '8px',
                                                    lineHeight: 1.5
                                                }}
                                            >
                                                {normalizeNode(tier.description)}
                                            </div>
                                        )}
                                    </div>

                                    {features.length > 0 ? (
                                        <ul
                                            style={{
                                                listStyle: 'none',
                                                padding: 0,
                                                margin: '0 0 32px 0',
                                                textAlign: 'left',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            }}
                                        >
                                            {features.map((feature, fidx) => (
                                                <li
                                                    key={fidx}
                                                    style={{
                                                        color: '#f8fafc',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="var(--primary)"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{ flexShrink: 0 }}
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    <span>{normalizeNode(feature)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p
                                            style={{
                                                margin: '0 0 32px 0',
                                                color: '#64748b',
                                                fontSize: '14px'
                                            }}
                                        >
                                            No features listed.
                                        </p>
                                    )}

                                    <Button
                                        label={normalizeNode(tier.ctaLabel) || 'Get Started'}
                                        variant={isPopular ? 'primary' : 'secondary'}
                                        style={{ width: '100%' }}
                                    />
                                </Card>
                            </div>
                        );
                    })
                ) : (
                    <p
                        style={{
                            color: '#64748b',
                            fontSize: '14px',
                            margin: 0
                        }}
                    >
                        No pricing tiers configured.
                    </p>
                )}
            </div>
        </div>
    );
};