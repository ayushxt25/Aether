'use client';

import React from 'react';
import { Version } from '@/types/plan';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
    history: Version[];
    currentId: number | null;
    onRollback: (id: number) => void;
    onDeleteVersion: (id: number) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function HistorySidebar({
    history,
    currentId,
    onRollback,
    onDeleteVersion,
    isOpen,
    onToggle,
}: HistorySidebarProps) {
    return (
        <aside
            style={{
                width: isOpen ? '320px' : '0px',
                minWidth: isOpen ? '320px' : '0px',
                height: '100%',
                background: '#0a0a0a',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'width 0.3s ease, min-width 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                flexShrink: 0,
            }}
        >
            <button
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    left: '-40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    background: '#0a0a0a',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                }}
                title={isOpen ? 'Close history' : 'Open history'}
            >
                <Clock
                    size={18}
                    style={{
                        color: '#c084fc',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
            </button>

            <div
                style={{
                    height: '100%',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.2s ease',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '32px',
                        flexShrink: 0,
                    }}
                >
                    <Clock size={18} color="#c084fc" />

                    <h2
                        style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#f8fafc',
                        }}
                    >
                        Version History
                    </h2>
                </div>

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        paddingRight: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    {history.slice().reverse().map((version) => {
                        const isCurrent = currentId === version.id;

                        return (
                            <div
                                key={version.id}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: isCurrent
                                        ? '1px solid rgba(168, 85, 247, 0.5)'
                                        : '1px solid rgba(255, 255, 255, 0.08)',
                                    background: isCurrent
                                        ? 'rgba(168, 85, 247, 0.12)'
                                        : 'rgba(255, 255, 255, 0.04)',
                                    color: '#ffffff',
                                    boxShadow: isCurrent
                                        ? '0 0 20px rgba(168, 85, 247, 0.15)'
                                        : 'none',
                                    transition: 'border-color 0.2s ease, background 0.2s ease',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            background: isCurrent
                                                ? 'rgba(168, 85, 247, 0.2)'
                                                : 'rgba(255, 255, 255, 0.08)',
                                            color: isCurrent
                                                ? '#d8b4fe'
                                                : 'rgba(255, 255, 255, 0.45)',
                                        }}
                                    >
                                        v{version.id}
                                    </span>

                                    <span
                                        style={{
                                            fontSize: '10px',
                                            color: 'rgba(255, 255, 255, 0.35)',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {new Date(version.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        lineHeight: 1.5,
                                        color: 'rgba(255, 255, 255, 0.78)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {version.explanation}
                                </p>

                                <div
                                    style={{
                                        marginTop: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onRollback(version.id)}
                                        style={{
                                            flex: 1,
                                            border: '1px solid rgba(168, 85, 247, 0.2)',
                                            background: 'rgba(168, 85, 247, 0.08)',
                                            color: '#c084fc',
                                            borderRadius: '8px',
                                            padding: '8px 10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Restore
                                        <RotateCcw size={13} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteVersion(version.id)}
                                        style={{
                                            border: '1px solid rgba(248, 113, 113, 0.25)',
                                            background: 'rgba(239, 68, 68, 0.08)',
                                            color: '#fecaca',
                                            borderRadius: '8px',
                                            padding: '8px 10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        title="Delete version"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {history.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '48px 0',
                            }}
                        >
                            <Clock
                                size={32}
                                style={{
                                    color: 'rgba(255, 255, 255, 0.12)',
                                    marginBottom: '12px',
                                }}
                            />

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.35)',
                                }}
                            >
                                No versions yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}