"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, RefreshCw, Trash2, Sparkles, Code2 } from 'lucide-react';

interface DiffViewerProps {
    mode: 'create' | 'modify';
    plan?: any;
    oldPlan?: any;
    newPlan?: any;
    code?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ mode, plan, oldPlan, newPlan, code }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (mode === 'create') {
        // Show what was created: list the components used
        if (!plan) return null;
        const components: string[] = plan.components_used || [];
        return (
            <div style={{
                marginTop: '12px',
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '10px',
                overflow: 'hidden',
                fontSize: '12px'
            }}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#a78bfa'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                            CREATED — {components.length} component{components.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {isExpanded ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                </button>

                {isExpanded && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {components.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd' }}>
                                <Plus style={{ width: '12px', height: '12px', color: '#34d399', flexShrink: 0 }} />
                                <span style={{ fontFamily: 'monospace' }}>{c}</span>
                            </div>
                        ))}
                        {code && (
                            <details style={{ marginTop: '8px' }}>
                                <summary style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Code2 style={{ width: '12px', height: '12px' }} />
                                    View generated code
                                </summary>
                                <pre style={{
                                    margin: 0,
                                    padding: '10px',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    fontSize: '11px',
                                    overflowX: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {code}
                                </pre>
                            </details>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // mode === 'modify'
    if (!newPlan) return null;

    const getDeltas = () => {
        const adds: string[] = [];
        const updates: string[] = [];
        const removes: string[] = [];

        if (newPlan.modifications) {
            newPlan.modifications.add?.forEach((a: any) => adds.push(`Add ${a.component} → ${a.target}`));
            newPlan.modifications.update?.forEach((u: any) => updates.push(`Update ${u.component} @ ${u.target}`));
            newPlan.modifications.remove?.forEach((r: any) => removes.push(`Remove ${r.component} from ${r.target}`));
        }
        return { adds, updates, removes };
    };

    const { adds, updates, removes } = getDeltas();
    const totalChanges = adds.length + updates.length + removes.length;
    const planHash = newPlan.hash?.substring(0, 8) || '—';

    return (
        <div style={{
            marginTop: '12px',
            background: 'rgba(5, 150, 105, 0.07)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: '10px',
            overflow: 'hidden',
            fontSize: '12px'
        }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#10b981'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw style={{ width: '14px', height: '14px' }} />
                    <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                        MODIFIED — {totalChanges} change{totalChanges !== 1 ? 's' : ''} · #{planHash}
                    </span>
                </div>
                {isExpanded ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
            </button>

            {isExpanded && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {adds.map((d, i) => (
                        <div key={`add-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontFamily: 'monospace' }}>
                            <Plus style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                            {d}
                        </div>
                    ))}
                    {updates.map((d, i) => (
                        <div key={`upd-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontFamily: 'monospace' }}>
                            <RefreshCw style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                            {d}
                        </div>
                    ))}
                    {removes.map((d, i) => (
                        <div key={`rem-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontFamily: 'monospace' }}>
                            <Trash2 style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                            {d}
                        </div>
                    ))}
                    {totalChanges === 0 && (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            No structural changes detected — props or styles updated only.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
