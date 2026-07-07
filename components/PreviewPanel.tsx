"use client";

import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as UI from './ui';
import { useAppState, useDataFetch } from '@/lib/state/appState';
import { MOCK_DATA } from '@/lib/mock/dataGenerator';
import { ErrorBoundary } from './ErrorBoundary';
import { Version } from '@/types/plan';

interface PreviewPanelProps {
    code: string;
    projectId?: number;
    onManualVersionSaved?: (version: Version) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    code,
    projectId,
    onManualVersionSaved,
}) => {
    const { state } = useAppState();
    const { themeConfig } = state;
    const [mode, setMode] = React.useState<'preview' | 'code'>('preview');
    const [copied, setCopied] = React.useState(false);
    const [editableCode, setEditableCode] = React.useState(code);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        setEditableCode(code);
    }, [code]);

    const sanitizeCode = (value: string) => value.replace(/^import\s+.*?;?\s*$/gm, '').trim();

    const sanitizedCode = sanitizeCode(editableCode);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(sanitizedCode);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to copy code:', error);
            alert('Failed to copy code.');
        }
    };

    const handleDownloadCode = () => {
        const componentCode = `"use client";

import React from 'react';

const GeneratedComponent = ${sanitizedCode};

export default GeneratedComponent;
`;

        const blob = new Blob([componentCode], {
            type: 'text/plain;charset=utf-8',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'GeneratedComponent.tsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const handleResetCode = () => {
        setEditableCode(code);
    };

    const handleSaveManualVersion = async () => {
        if (!projectId) {
            alert('Select a project before saving code.');
            return;
        }

        if (!sanitizedCode) {
            alert('Code is empty.');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/versions/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    code: sanitizedCode,
                    explanation: 'Saved manual code edit from live editor.',
                }),
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.error?.message || 'Failed to save manual version.');
                return;
            }

            const savedVersion: Version = result.data.version;

            onManualVersionSaved?.(savedVersion);
            setMode('preview');
        } catch (error) {
            console.error('Failed to save manual version:', error);
            alert('Failed to save manual version.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            style={{
                flex: 1.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#0f172a',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a',
                    gap: '12px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#4ade80',
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '14px',
                            margin: 0,
                            color: '#f8fafc',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                        }}
                    >
                        LIVE WORKSPACE
                    </h2>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                    }}
                >
                    {mode === 'code' && (
                        <>
                            <button
                                type="button"
                                onClick={handleResetCode}
                                disabled={editableCode === code}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: editableCode === code ? '#64748b' : '#e2e8f0',
                                    fontSize: '12px',
                                    cursor: editableCode === code ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveManualVersion}
                                disabled={isSaving || !sanitizedCode || editableCode === code}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(34, 197, 94, 0.25)',
                                    background: 'rgba(34, 197, 94, 0.12)',
                                    color: isSaving ? '#86efac' : '#bbf7d0',
                                    fontSize: '12px',
                                    cursor: isSaving || !sanitizedCode || editableCode === code ? 'not-allowed' : 'pointer',
                                    fontWeight: 700,
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Version'}
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={handleCopyCode}
                        disabled={!sanitizedCode}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: copied ? '#86efac' : '#e2e8f0',
                            fontSize: '12px',
                            cursor: sanitizedCode ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadCode}
                        disabled={!sanitizedCode}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#e2e8f0',
                            fontSize: '12px',
                            cursor: sanitizedCode ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Download
                    </button>

                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            background: '#1e293b',
                            padding: '4px',
                            borderRadius: '6px',
                        }}
                    >
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
                                transition: 'all 0.2s',
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
                                transition: 'all 0.2s',
                            }}
                        >
                            Source Code
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '20px',
                    position: 'relative',
                }}
            >
                {mode === 'preview' ? (
                    <LiveProvider
                        code={sanitizedCode}
                        scope={{
                            ...UI,
                            useAppState,
                            useDataFetch,
                            MOCK_DATA,
                            React,
                            useEffect: React.useEffect,
                            useState: React.useState,
                        }}
                        noInline={false}
                    >
                        <div
                            style={{
                                minHeight: '100%',
                                background: themeConfig.theme === 'dark' ? '#1e293b' : '#ffffff',
                                color: themeConfig.theme === 'dark' ? '#f8fafc' : '#0f172a',
                                fontFamily: themeConfig.fontFamily,
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '24px',
                                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                                '--primary': themeConfig.primaryColor,
                                '--secondary': themeConfig.secondaryColor,
                            } as React.CSSProperties}
                        >
                            <ErrorBoundary>
                                <LivePreview />
                            </ErrorBoundary>
                        </div>

                        <div
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                right: '20px',
                            }}
                        >
                            <LiveError
                                style={{
                                    color: '#f87171',
                                    fontSize: '12px',
                                    margin: 0,
                                    padding: '12px',
                                    background: '#450a0a',
                                    borderRadius: '6px',
                                }}
                            />
                        </div>
                    </LiveProvider>
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#1e293b',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <textarea
                            value={editableCode}
                            onChange={(event) => setEditableCode(event.target.value)}
                            spellCheck={false}
                            style={{
                                flex: 1,
                                width: '100%',
                                minHeight: '520px',
                                resize: 'none',
                                border: 'none',
                                outline: 'none',
                                background: '#020617',
                                color: '#e2e8f0',
                                padding: '20px',
                                fontSize: '13px',
                                lineHeight: 1.7,
                                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                                whiteSpace: 'pre',
                                overflow: 'auto',
                            }}
                        />

                        <p
                            style={{
                                margin: 0,
                                padding: '12px 16px',
                                fontSize: '12px',
                                color: '#94a3b8',
                                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                background: '#0f172a',
                            }}
                        >
                            Edit the generated React arrow component here. Switch to Visual to preview changes, then Save Version to store it in history.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};