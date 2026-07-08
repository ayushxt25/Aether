'use client';

import React from 'react';
import { Version } from '@/types/plan';
import {
  Clock,
  RotateCcw,
  Trash2,
  Copy,
  GitBranch,
  History,
  Sparkles,
} from 'lucide-react';

interface HistorySidebarProps {
  history: Version[];
  currentId: number | null;
  onRollback: (id: number) => void;
  onDeleteVersion: (id: number) => void;
  onDuplicateVersion: (id: number) => void;
  onForkVersion: (id: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistorySidebar({
  history,
  currentId,
  onRollback,
  onDeleteVersion,
  onDuplicateVersion,
  onForkVersion,
  isOpen,
  onToggle,
}: HistorySidebarProps) {
  const orderedHistory = history.slice().reverse();

  return (
    <aside
      style={{
        width: isOpen ? '340px' : '0px',
        minWidth: isOpen ? '340px' : '0px',
        height: '100%',
        background:
          'radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 34%), rgba(7, 10, 18, 0.98)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'width 260ms ease, min-width 260ms ease',
        position: 'relative',
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute',
          left: '-42px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '42px',
          height: '46px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRight: 'none',
          borderRadius: '14px 0 0 14px',
          background: 'rgba(15, 23, 42, 0.96)',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          zIndex: 20,
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(14px)',
        }}
        title={isOpen ? 'Close history' : 'Open history'}
      >
        <Clock
          size={18}
          style={{
            color: '#c084fc',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 260ms ease',
          }}
        />
      </button>

      <div
        style={{
          height: '100%',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 180ms ease',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            padding: '15px',
            borderRadius: '22px',
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: '0 18px 55px rgba(0, 0, 0, 0.22)',
            marginBottom: '14px',
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '11px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    boxShadow: '0 12px 30px rgba(99, 102, 241, 0.32)',
                  }}
                >
                  <History size={15} color="#ffffff" />
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#c4b5fd',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Version History
                </div>
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 950,
                  color: '#f8fafc',
                  letterSpacing: '-0.04em',
                }}
              >
                Saved UI states
              </h2>

              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '12px',
                  lineHeight: 1.55,
                  color: '#94a3b8',
                }}
              >
                Restore, duplicate, fork, or delete generated versions.
              </p>
            </div>

            <div
              style={{
                padding: '7px 9px',
                borderRadius: '999px',
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.22)',
                color: '#d8b4fe',
                fontSize: '11px',
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {history.length} saved
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {orderedHistory.map((version, index) => {
            const isCurrent = currentId === version.id;
            const time = new Date(version.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={version.id}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '18px',
                  border: isCurrent
                    ? '1px solid rgba(168, 85, 247, 0.55)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isCurrent
                    ? 'linear-gradient(180deg, rgba(168, 85, 247, 0.16), rgba(99, 102, 241, 0.08))'
                    : 'rgba(255, 255, 255, 0.045)',
                  color: '#ffffff',
                  boxShadow: isCurrent
                    ? '0 18px 45px rgba(99, 102, 241, 0.18)'
                    : '0 12px 32px rgba(0, 0, 0, 0.12)',
                  transition:
                    'border-color 180ms ease, background 180ms ease, transform 180ms ease, box-shadow 180ms ease',
                  animation: 'panelReveal 180ms ease both',
                  animationDelay: `${Math.min(index * 25, 160)}ms`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        padding: '4px 9px',
                        borderRadius: '999px',
                        background: isCurrent
                          ? 'rgba(168, 85, 247, 0.22)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isCurrent ? '#f3e8ff' : 'rgba(255, 255, 255, 0.62)',
                        border: isCurrent
                          ? '1px solid rgba(168, 85, 247, 0.22)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      v{version.id}
                    </span>

                    {isCurrent && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          fontWeight: 900,
                          color: '#d8b4fe',
                        }}
                      >
                        <Sparkles size={11} />
                        Active
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.38)',
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {time}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'rgba(255, 255, 255, 0.78)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {version.explanation || 'Generated interface version'}
                </p>

                <div
                  style={{
                    marginTop: '13px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 38px 38px 38px',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onRollback(version.id)}
                    style={{
                      border: '1px solid rgba(168, 85, 247, 0.26)',
                      background: isCurrent
                        ? 'rgba(168, 85, 247, 0.18)'
                        : 'rgba(168, 85, 247, 0.08)',
                      color: '#d8b4fe',
                      borderRadius: '11px',
                      padding: '9px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 850,
                    }}
                  >
                    Restore
                    <RotateCcw size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateVersion(version.id)}
                    style={{
                      border: '1px solid rgba(96, 165, 250, 0.25)',
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: '#bfdbfe',
                      borderRadius: '11px',
                      padding: '9px',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                    title="Duplicate version"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onForkVersion(version.id)}
                    style={{
                      border: '1px solid rgba(45, 212, 191, 0.25)',
                      background: 'rgba(20, 184, 166, 0.08)',
                      color: '#99f6e4',
                      borderRadius: '11px',
                      padding: '9px',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                    title="Fork into new project"
                  >
                    <GitBranch size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteVersion(version.id)}
                    style={{
                      border: '1px solid rgba(248, 113, 113, 0.25)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#fecaca',
                      borderRadius: '11px',
                      padding: '9px',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
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
                height: '100%',
                minHeight: '360px',
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                padding: '24px',
                borderRadius: '22px',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.035)',
              }}
            >
              <div>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 14px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.18)',
                  }}
                >
                  <Clock size={24} color="#c084fc" />
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#f8fafc',
                    letterSpacing: '-0.03em',
                  }}
                >
                  No versions yet
                </h3>

                <p
                  style={{
                    margin: '8px auto 0',
                    maxWidth: '230px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.45)',
                  }}
                >
                  Generate your first UI from the chat panel. Every saved result will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}