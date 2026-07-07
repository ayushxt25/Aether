import React from 'react';

interface GridProps {
    children: React.ReactNode;
    columns?: number;
    gap?: string;
    minColumnWidth?: string;
}

export const Grid: React.FC<GridProps> = ({
    children,
    columns = 3,
    gap = '16px',
    minColumnWidth = '240px',
}) => {
    const safeColumns = Math.max(1, columns);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${safeColumns}, minmax(${minColumnWidth}, 1fr))`,
                gap,
                width: '100%',
                alignItems: 'stretch',
            }}
        >
            {children}
        </div>
    );
};