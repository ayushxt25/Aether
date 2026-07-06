import React from 'react';

interface TableProps {
    headers?: React.ReactNode[] | string[];
    rows?: Array<Array<React.ReactNode> | Record<string, React.ReactNode>>;
    data?: Array<Record<string, React.ReactNode>>;
    columns?: React.ReactNode[] | string[];
    style?: React.CSSProperties;
}

function normalizeCell(value: React.ReactNode): React.ReactNode {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object' && !React.isValidElement(value) && !Array.isArray(value)) {
        return JSON.stringify(value);
    }

    return value;
}

function normalizeHeaders(headers?: React.ReactNode[] | string[], data?: Array<Record<string, React.ReactNode>>) {
    if (Array.isArray(headers) && headers.length > 0) {
        return headers.map(normalizeCell);
    }

    if (Array.isArray(data) && data.length > 0) {
        return Object.keys(data[0]);
    }

    return ['Name', 'Value'];
}

function normalizeRows(
    rows?: Array<Array<React.ReactNode> | Record<string, React.ReactNode>>,
    data?: Array<Record<string, React.ReactNode>>,
    headers?: React.ReactNode[]
) {
    const source = Array.isArray(rows) && rows.length > 0 ? rows : data;

    if (!Array.isArray(source) || source.length === 0) {
        return [];
    }

    return source.map((row) => {
        if (Array.isArray(row)) {
            return row.map(normalizeCell);
        }

        if (typeof row === 'object' && row !== null) {
            return headers?.map((header) => normalizeCell(row[String(header)])) ?? Object.values(row).map(normalizeCell);
        }

        return [normalizeCell(row)];
    });
}

export const Table: React.FC<TableProps> = ({
    headers,
    columns,
    rows,
    data,
    style
}) => {
    const safeHeaders = normalizeHeaders(headers || columns, data);
    const safeRows = normalizeRows(rows, data, safeHeaders);

    const tableWrapperStyle: React.CSSProperties = {
        width: '100%',
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
        textAlign: 'left',
    };

    const thStyle: React.CSSProperties = {
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#94a3b8',
        fontWeight: 600,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        whiteSpace: 'nowrap',
    };

    const tdStyle: React.CSSProperties = {
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#e2e8f0',
        whiteSpace: 'nowrap',
    };

    return (
        <div style={tableWrapperStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        {safeHeaders.map((header, i) => (
                            <th key={i} style={thStyle}>
                                {normalizeCell(header)}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {safeRows.length > 0 ? (
                        safeRows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} style={tdStyle}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={safeHeaders.length}
                                style={{
                                    ...tdStyle,
                                    color: '#64748b',
                                    textAlign: 'center',
                                }}
                            >
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};