import React from 'react';

type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';

interface ChartProps {
    type?: ChartType | string;
    data?: unknown;
    title?: React.ReactNode;
    labels?: React.ReactNode[];
    values?: number[];
    style?: React.CSSProperties;
}

function normalizeChartType(type?: ChartType | string): ChartType {
    if (type === 'line' || type === 'bar' || type === 'pie' || type === 'area' || type === 'donut') {
        return type;
    }

    return 'bar';
}

function safeStringify(value: unknown): string {
    if (value === null || value === undefined) {
        return 'No data provided';
    }

    try {
        return JSON.stringify(value).substring(0, 80);
    } catch {
        return 'Data provided';
    }
}

function getChartBars(values?: number[]): number[] {
    if (!Array.isArray(values) || values.length === 0) {
        return [40, 70, 45, 90, 65, 80];
    }

    const max = Math.max(...values.map((v) => Number(v) || 0), 1);

    return values.map((value) => {
        const numericValue = Number(value) || 0;
        return Math.max(10, Math.min(100, (numericValue / max) * 100));
    });
}

export const Chart: React.FC<ChartProps> = ({
    type = 'bar',
    data,
    title,
    labels,
    values,
    style
}) => {
    const safeType = normalizeChartType(type);
    const bars = getChartBars(values);

    return (
        <div
            style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                color: '#f8fafc',
                ...style
            }}
        >
            <div
                style={{
                    color: '#6366f1',
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                }}
            >
                {title || `${safeType} Chart`}
            </div>

            <div
                style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                Data Context: {safeStringify(data)}
            </div>

            <div
                style={{
                    marginTop: '20px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    height: '80px',
                    width: '100%',
                }}
            >
                {bars.map((height, index) => (
                    <div
                        key={index}
                        title={labels?.[index] ? String(labels[index]) : `Value ${index + 1}`}
                        style={{
                            width: safeType === 'line' ? '18px' : '14px',
                            height: `${height}%`,
                            background: safeType === 'pie' || safeType === 'donut'
                                ? 'radial-gradient(circle, #a855f7, #6366f1)'
                                : 'linear-gradient(to top, #6366f1, #a855f7)',
                            borderRadius: safeType === 'pie' || safeType === 'donut' ? '999px' : '3px',
                            opacity: 0.9,
                        }}
                    />
                ))}
            </div>

            {Array.isArray(labels) && labels.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '8px',
                    }}
                >
                    {labels.slice(0, 6).map((label, index) => (
                        <span
                            key={index}
                            style={{
                                fontSize: '10px',
                                color: '#94a3b8',
                            }}
                        >
                            {String(label)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};