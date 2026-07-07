'use client';

import React from 'react';
import {
    Clock,
    Copy,
    ExternalLink,
    GitBranch,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { PromptRun } from '@/types/run';

interface PromptRunsViewProps {
    runs: PromptRun[];
    isLoading: boolean;
    onOpenRun: (run: PromptRun) => void;
    onDuplicateRun: (run: PromptRun) => void;
    onForkRun: (run: PromptRun) => void;
    onDeleteRun: (run: PromptRun) => void;
    onRefresh: () => void;
}

function getSourceLabel(source: string) {
    if (source === 'manual') return 'Manual Edit';
    if (source === 'duplicate') return 'Duplicate';
    if (source === 'fork') return 'Fork';
    if (source === 'modified') return 'Modified';
    return 'Generated';
}

function getSourceColor(source: string) {
    if (source === 'manual') return '#86efac';
    if (source === 'duplicate') return '#bfdbfe';
    if (source === 'fork') return '#99f6e4';
    if (source === 'modified') return '#fcd34d';
    return '#d8b4fe';
}

export function PromptRunsView({
    runs,
    isLoading,
    onOpenRun,
    onDuplicateRun,
    onForkRun,
    onDeleteRun,
    onRefresh,
}: PromptRunsViewProps) {
    const [query, setQuery] = React.useState('');
    const [sourceFilter, setSourceFilter] = React.useState('all');

    const filteredRuns = runs.filter((run) => {
        const searchText = `${run.projectName} ${run.prompt} ${run.explanation} ${run.source}`.toLowerCase();
        const matchesQuery = searchText.includes(query.toLowerCase());
        const matchesSource = sourceFilter === 'all' || run.source === sourceFilter;

        return matchesQuery && matchesSource;
    });

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                background:
                    'radial-gradient(circle at top left, rgba(168, 85, 247, 0.16), transparent 32%), #020617',
                color: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    padding: '28px 32px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    background: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(18px)',
                }}
            >
                <div>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.22)',
                            color: '#d8b4fe',
                            fontSize: '12px',
                            fontWeight: 700,
                            marginBottom: '14px',
                        }}
                    >
                        <Sparkles size={14} />
                        Prompt Traceability
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: '28px',
                            letterSpacing: '-0.04em',
                            color: '#ffffff',
                        }}
                    >
                        Prompt Runs
                    </h1>

                    <p
                        style={{
                            margin: '8px 0 0',
                            maxWidth: '720px',
                            fontSize: '14px',
                            lineHeight: 1.7,
                            color: '#94a3b8',
                        }}
                    >
                        Review every generated, modified, forked, duplicated, and manually saved UI version across your Aether projects.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    style={{
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Refresh
                </button>
            </div>

            <div
                style={{
                    padding: '20px 32px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'rgba(2, 6, 23, 0.6)',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <Search size={16} color="#94a3b8" />

                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search prompts, projects, explanations..."
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: '#f8fafc',
                            fontSize: '14px',
                        }}
                    />
                </div>

                <select
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                    style={{
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        outline: 'none',
                    }}
                >
                    <option value="all">All runs</option>
                    <option value="generated">Generated</option>
                    <option value="modified">Modified</option>
                    <option value="manual">Manual</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="fork">Fork</option>
                </select>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '28px 32px 96px',
                }}
            >
                {isLoading ? (
                    <div
                        style={{
                            padding: '64px',
                            textAlign: 'center',
                            color: '#94a3b8',
                        }}
                    >
                        Loading prompt runs...
                    </div>
                ) : filteredRuns.length === 0 ? (
                    <div
                        style={{
                            padding: '64px',
                            textAlign: 'center',
                            color: '#94a3b8',
                            border: '1px dashed rgba(255, 255, 255, 0.12)',
                            borderRadius: '18px',
                            background: 'rgba(15, 23, 42, 0.55)',
                        }}
                    >
                        No prompt runs found.
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                            gap: '18px',
                        }}
                    >
                        {filteredRuns.map((run) => (
                            <article
                                key={run.id}
                                style={{
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    background:
                                        'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.72))',
                                    borderRadius: '18px',
                                    padding: '18px',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.24)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                color: '#ffffff',
                                                fontSize: '15px',
                                                fontWeight: 800,
                                                marginBottom: '6px',
                                            }}
                                        >
                                            {run.projectName}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#94a3b8',
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '999px',
                                                    padding: '4px 8px',
                                                }}
                                            >
                                                v{run.versionNo || run.versionId}
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: getSourceColor(run.source),
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '999px',
                                                    padding: '4px 8px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {getSourceLabel(run.source)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onOpenRun(run)}
                                        style={{
                                            border: '1px solid rgba(168, 85, 247, 0.25)',
                                            background: 'rgba(168, 85, 247, 0.12)',
                                            color: '#e9d5ff',
                                            borderRadius: '10px',
                                            padding: '8px 10px',
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        Open
                                        <ExternalLink size={13} />
                                    </button>
                                </div>

                                <div
                                    style={{
                                        minHeight: '72px',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        background: 'rgba(2, 6, 23, 0.52)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: '#64748b',
                                            fontWeight: 700,
                                            marginBottom: '6px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        Prompt
                                    </div>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: run.prompt ? '#e2e8f0' : '#64748b',
                                            fontSize: '13px',
                                            lineHeight: 1.55,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {run.prompt || 'No prompt recorded for this run.'}
                                    </p>
                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#94a3b8',
                                        fontSize: '13px',
                                        lineHeight: 1.55,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {run.explanation}
                                </p>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#64748b',
                                        fontSize: '12px',
                                    }}
                                >
                                    <Clock size={13} />
                                    {new Date(run.timestamp).toLocaleString()}
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                        gap: '8px',
                                        marginTop: 'auto',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onOpenRun(run)}
                                        style={{
                                            border: '1px solid rgba(168, 85, 247, 0.25)',
                                            background: 'rgba(168, 85, 247, 0.1)',
                                            color: '#e9d5ff',
                                            borderRadius: '10px',
                                            padding: '9px 8px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <ExternalLink size={13} />
                                        Open
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDuplicateRun(run)}
                                        style={{
                                            border: '1px solid rgba(96, 165, 250, 0.25)',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#bfdbfe',
                                            borderRadius: '10px',
                                            padding: '9px 8px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <Copy size={13} />
                                        Copy
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onForkRun(run)}
                                        style={{
                                            border: '1px solid rgba(45, 212, 191, 0.25)',
                                            background: 'rgba(20, 184, 166, 0.1)',
                                            color: '#99f6e4',
                                            borderRadius: '10px',
                                            padding: '9px 8px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <GitBranch size={13} />
                                        Fork
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteRun(run)}
                                        style={{
                                            border: '1px solid rgba(248, 113, 113, 0.25)',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#fecaca',
                                            borderRadius: '10px',
                                            padding: '9px 8px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <Trash2 size={13} />
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}