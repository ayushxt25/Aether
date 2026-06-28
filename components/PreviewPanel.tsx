"use client";

import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as UI from './ui';
import { useAppState, useDataFetch } from '@/lib/state/appState';
import { MOCK_DATA } from '@/lib/mock/dataGenerator';
import { ErrorBoundary } from './ErrorBoundary';

interface PreviewPanelProps {
    code: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ code }) => {
    const { state } = useAppState();
    const { themeConfig } = state;
    const [mode, setMode] = React.useState<'preview' | 'code'>('preview');

    // Strip import statements from AI-generated code before passing to Buble/react-live.
    // react-live uses Buble, which doesn't support ES6 import/export syntax.
    // Components are already available via the LiveProvider scope.
    const sanitizedCode = code.replace(/^import\s+.*?;?\s*$/gm, '').trim();

    return (
        <div style={{
            flex: 1.2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0f172a'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                    <h2 style={{ fontSize: '14px', margin: 0, color: '#f8fafc', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE WORKSPACE</h2>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: '#1e293b', padding: '4px', borderRadius: '6px' }}>
                    <button
                        onClick={() => setMode('preview')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: mode === 'preview' ? 'var(--primary)' : 'transparent',
                            color: mode === 'preview' ? '#fff' : '#94a3b8',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Visual
                    </button>
                    <button
                        onClick={() => setMode('code')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: mode === 'code' ? 'var(--primary)' : 'transparent',
                            color: mode === 'code' ? '#fff' : '#94a3b8',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Source Code
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px', position: 'relative' }}>
                {mode === 'preview' ? (
                    <LiveProvider code={sanitizedCode} scope={{ ...UI, useAppState, useDataFetch, MOCK_DATA, React, useEffect: React.useEffect, useState: React.useState }} noInline={false}>
                        <div style={{
                            minHeight: '100%',
                            background: themeConfig.theme === 'dark' ? '#1e293b' : '#ffffff',
                            color: themeConfig.theme === 'dark' ? '#f8fafc' : '#0f172a',
                            fontFamily: themeConfig.fontFamily,
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '24px',
                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                            // Expose the theme colors as CSS variables for the generated components
                            '--primary': themeConfig.primaryColor,
                            '--secondary': themeConfig.secondaryColor,
                        } as any}>
                            <ErrorBoundary>
                                <LivePreview />
                            </ErrorBoundary>
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                            <LiveError style={{ color: '#f87171', fontSize: '12px', margin: 0, padding: '12px', background: '#450a0a', borderRadius: '6px' }} />
                        </div>
                    </LiveProvider>
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1e293b', padding: '20px', borderRadius: '12px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, fontSize: '14px', fontFamily: '"Fira Code", monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                            {code}
                        </pre>
                        <p style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
                            * Code is derived directly from the AI Planner. Use the Chat Panel for partial rewrites (e.g. "Regenerate the Navbar to have a blue button") to maintain the deterministic valid AST.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
