"use client";

import React, { useState } from 'react';

interface TabItem {
    label: string;
    id: string;
}

interface TabsProps {
    tabs: TabItem[];
    children?: React.ReactNode | ((activeTab: string) => React.ReactNode);
}

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.id || '');

    const renderContent = () => {
        if (typeof children === 'function') {
            return children(activeTab);
        }

        return children ?? null;
    };

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '16px',
                    overflowX: 'auto',
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 16px',
                            border: 'none',
                            borderBottom: activeTab === tab.id
                                ? '2px solid var(--primary)'
                                : '2px solid transparent',
                            background: activeTab === tab.id
                                ? 'rgba(99, 102, 241, 0.12)'
                                : 'transparent',
                            color: activeTab === tab.id
                                ? 'var(--primary)'
                                : '#94a3b8',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: '14px',
                            borderRadius: '8px 8px 0 0',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1 }}>
                {renderContent()}
            </div>
        </div>
    );
};