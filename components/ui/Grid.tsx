"use client";

import React from 'react';

interface GridProps {
    columns?: number | string;
    gap?: string | number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    minColumnWidth?: string;
}

function normalizeColumns(columns?: number | string): number {
    const numericColumns = Number(columns);

    if (!Number.isFinite(numericColumns)) {
        return 3;
    }

    return Math.max(1, Math.min(6, Math.floor(numericColumns)));
}

function normalizeGap(gap?: string | number): string {
    if (gap === null || gap === undefined) {
        return '20px';
    }

    if (typeof gap === 'number') {
        return `${gap}px`;
    }

    return gap;
}

export const Grid: React.FC<GridProps> = ({
    columns = 3,
    gap = '20px',
    children,
    style,
    minColumnWidth
}) => {
    const safeColumns = normalizeColumns(columns);
    const safeGap = normalizeGap(gap);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: minColumnWidth
                    ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`
                    : `repeat(${safeColumns}, minmax(0, 1fr))`,
                gap: safeGap,
                width: '100%',
                ...style
            }}
        >
            {children}
        </div>
    );
};