"use client";

import React from 'react';
import { Button } from './Button';

type HeroCta =
    | string
    | {
        label?: string;
        variant?: 'primary' | 'secondary';
    };

interface HeroProps {
    title?: string;
    subtitle?: string;
    ctaPrimary?: HeroCta;
    ctaSecondary?: HeroCta;
}

function getCtaLabel(cta?: HeroCta): string {
    if (!cta) return '';

    if (typeof cta === 'string') {
        return cta;
    }

    return cta.label || '';
}

function getCtaVariant(cta: HeroCta | undefined, fallback: 'primary' | 'secondary'): 'primary' | 'secondary' {
    if (!cta || typeof cta === 'string') {
        return fallback;
    }

    return cta.variant === 'secondary' ? 'secondary' : 'primary';
}

export const Hero: React.FC<HeroProps> = ({
    title = 'Build faster with Aether',
    subtitle = 'Generate, preview, and refine production-style interfaces from natural language.',
    ctaPrimary,
    ctaSecondary,
}) => {
    const primaryLabel = getCtaLabel(ctaPrimary);
    const secondaryLabel = getCtaLabel(ctaSecondary);

    return (
        <section
            style={{
                width: '100%',
                padding: '40px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(15,23,42,0.9))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
            }}
        >
            <h1
                style={{
                    margin: 0,
                    fontSize: '36px',
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                }}
            >
                {title}
            </h1>

            <p
                style={{
                    marginTop: '16px',
                    marginBottom: 0,
                    maxWidth: '680px',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#cbd5e1',
                }}
            >
                {subtitle}
            </p>

            {(primaryLabel || secondaryLabel) && (
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        marginTop: '24px',
                        flexWrap: 'wrap',
                    }}
                >
                    {primaryLabel && (
                        <Button
                            label={primaryLabel}
                            variant={getCtaVariant(ctaPrimary, 'primary')}
                        />
                    )}

                    {secondaryLabel && (
                        <Button
                            label={secondaryLabel}
                            variant={getCtaVariant(ctaSecondary, 'secondary')}
                        />
                    )}
                </div>
            )}
        </section>
    );
};