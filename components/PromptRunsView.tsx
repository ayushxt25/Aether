'use client';

import React from 'react';
import {
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  Filter,
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

function getSourceBackground(source: string) {
  if (source === 'manual') return 'rgba(34, 197, 94, 0.1)';
  if (source === 'duplicate') return 'rgba(59, 130, 246, 0.1)';
  if (source === 'fork') return 'rgba(20, 184, 166, 0.1)';
  if (source === 'modified') return 'rgba(245, 158, 11, 0.1)';
  return 'rgba(168, 85, 247, 0.1)';
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

  const actionButtonStyle: React.CSSProperties = {
    borderRadius: '11px',
    padding: '9px 8px',
    fontSize: '11px',
    fontWeight: 850,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(168, 85, 247, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.09), transparent 34%), #020617',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '28px 96px 26px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          background: 'rgba(15, 23, 42, 0.76)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 11px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.22)',
              color: '#d8b4fe',
              fontSize: '12px',
              fontWeight: 850,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={14} />
            Prompt Traceability
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              letterSpacing: '-0.055em',
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            Prompt Runs
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              maxWidth: '760px',
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
          disabled={isLoading}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: isLoading
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(255, 255, 255, 0.07)',
            color: '#e2e8f0',
            borderRadius: '13px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 850,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            boxShadow: '0 14px 34px rgba(0, 0, 0, 0.18)',
          }}
        >
          {isLoading ? <Loader2 size={14} className="spin-slow" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      <div
        style={{
          padding: '18px 32px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(2, 6, 23, 0.64)',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '11px 13px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: query ? '0 0 0 3px rgba(168, 85, 247, 0.1)' : 'none',
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
              fontWeight: 600,
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
          }}
        >
          <Filter size={15} color="#94a3b8" />

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#f8fafc',
              padding: '11px 0',
              fontSize: '13px',
              fontWeight: 750,
              outline: 'none',
              cursor: 'pointer',
              colorScheme: 'dark',
appearance: 'none',
            }}
          >
            <option style={{ background: '#0f172a', color: '#f8fafc' }} value="all">
  All runs
</option>
<option style={{ background: '#0f172a', color: '#f8fafc' }} value="generated">
  Generated
</option>
<option style={{ background: '#0f172a', color: '#f8fafc' }} value="modified">
  Modified
</option>
<option style={{ background: '#0f172a', color: '#f8fafc' }} value="manual">
  Manual
</option>
<option style={{ background: '#0f172a', color: '#f8fafc' }} value="duplicate">
  Duplicate
</option>
<option style={{ background: '#0f172a', color: '#f8fafc' }} value="fork">
  Fork
</option>
          </select>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 32px 104px',
        }}
      >
        {isLoading ? (
          <div
            style={{
              minHeight: '420px',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            <div>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '20px',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 15px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <Loader2 size={24} className="spin-slow" color="#c084fc" />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  color: '#f8fafc',
                  letterSpacing: '-0.035em',
                }}
              >
                Loading prompt runs
              </h3>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '13px',
                  color: '#94a3b8',
                }}
              >
                Fetching your latest generation history.
              </p>
            </div>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div
            style={{
              minHeight: '420px',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              color: '#94a3b8',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.55)',
            }}
          >
            <div>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '20px',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 15px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <Wand2 size={24} color="#c084fc" />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  color: '#f8fafc',
                  letterSpacing: '-0.035em',
                }}
              >
                No prompt runs found
              </h3>

              <p
                style={{
                  margin: '8px auto 0',
                  maxWidth: '340px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#94a3b8',
                }}
              >
                Generate, modify, duplicate, fork, or manually save a UI version. Your prompt activity will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '18px',
            }}
          >
            {filteredRuns.map((run, index) => (
              <article
                key={run.id}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  background:
                    'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.72))',
                  borderRadius: '22px',
                  padding: '18px',
                  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  animation: 'panelReveal 180ms ease both',
                  animationDelay: `${Math.min(index * 20, 160)}ms`,
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
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 950,
                        marginBottom: '7px',
                        letterSpacing: '-0.035em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '260px',
                      }}
                      title={run.projectName}
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
                          color: '#cbd5e1',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '999px',
                          padding: '4px 8px',
                          fontWeight: 800,
                        }}
                      >
                        v{run.versionNo || run.versionId}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          color: getSourceColor(run.source),
                          background: getSourceBackground(run.source),
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '999px',
                          padding: '4px 8px',
                          fontWeight: 850,
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
                      border: '1px solid rgba(168, 85, 247, 0.28)',
                      background: 'rgba(168, 85, 247, 0.13)',
                      color: '#e9d5ff',
                      borderRadius: '12px',
                      padding: '9px 11px',
                      fontSize: '12px',
                      fontWeight: 850,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    Open
                    <ExternalLink size={13} />
                  </button>
                </div>

                <div
                  style={{
                    minHeight: '78px',
                    borderRadius: '15px',
                    padding: '13px',
                    background: 'rgba(2, 6, 23, 0.52)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: 850,
                      marginBottom: '7px',
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
                  {run.explanation || 'No explanation available for this run.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 650,
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
                      ...actionButtonStyle,
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      background: 'rgba(168, 85, 247, 0.1)',
                      color: '#e9d5ff',
                    }}
                  >
                    <ExternalLink size={13} />
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateRun(run)}
                    style={{
                      ...actionButtonStyle,
                      border: '1px solid rgba(96, 165, 250, 0.25)',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#bfdbfe',
                    }}
                  >
                    <Copy size={13} />
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => onForkRun(run)}
                    style={{
                      ...actionButtonStyle,
                      border: '1px solid rgba(45, 212, 191, 0.25)',
                      background: 'rgba(20, 184, 166, 0.1)',
                      color: '#99f6e4',
                    }}
                  >
                    <GitBranch size={13} />
                    Fork
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRun(run)}
                    style={{
                      ...actionButtonStyle,
                      border: '1px solid rgba(248, 113, 113, 0.25)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#fecaca',
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