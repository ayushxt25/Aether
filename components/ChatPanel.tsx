'use client';

import React, { useMemo, useState } from 'react';
import { useAppState } from '@/lib/state/appState';
import { Send, Sparkles, AlertCircle, Wand2, Loader2, PencilLine } from 'lucide-react';
import { Version } from '@/types/plan';
import { DiffViewer } from './DiffViewer';
import { parseApiResponse } from '@/lib/client/apiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  diffMode?: 'create' | 'modify';
  plan?: any;
  oldPlan?: any;
  newPlan?: any;
  code?: string;
}

interface ChatPanelProps {
  onNewVersion: (version: Version) => void;
  currentVersionId?: number;
  projectId: number | null;
}

const PROMPT_SUGGESTIONS = [
  'Create a premium analytics dashboard for a Windows performance app',
  'Design a SaaS landing page for an AI productivity platform',
  'Build an admin dashboard with metrics, charts, filters, and user table',
  'Create a CRM workspace for startup sales teams',
];

const MODIFY_SUGGESTIONS = [
  'Make this UI more executive-focused with better spacing and stronger hierarchy',
  'Add a weekly summary section and make the alert cards more prominent',
  'Improve the dashboard layout with cleaner cards and a more premium visual style',
  'Add segmentation, activity insights, and stronger call-to-action areas',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onNewVersion,
  currentVersionId,
  projectId,
}) => {
  const { state } = useAppState();
  const { themeConfig } = state;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome to Aether. Describe the interface you want to build, or select a suggestion below. I’ll generate a polished React UI and keep every version saved.",
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const mode = currentVersionId ? 'modify' : 'generate';
  const suggestions = useMemo(
    () => (mode === 'modify' ? MODIFY_SUGGESTIONS : PROMPT_SUGGESTIONS),
    [mode]
  );

  const handleSend = async (overrideInput?: string) => {
    const finalInput = overrideInput || input;

    if (!finalInput.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: finalInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const isFreshIntent =
        finalInput.toLowerCase().includes('build') ||
        finalInput.toLowerCase().includes('create') ||
        finalInput.toLowerCase().includes('design') ||
        finalInput.toLowerCase().includes('clone');

      const actualVersionId = isFreshIntent ? undefined : currentVersionId;
      const endpoint = actualVersionId ? '/api/modify' : '/api/generate';
      const diffMode: 'create' | 'modify' = actualVersionId ? 'modify' : 'create';

      const richIntent = `[CONTEXT: The current UI theme is ${themeConfig.theme}, with primary color ${themeConfig.primaryColor}, secondary color ${themeConfig.secondaryColor}, and font ${themeConfig.fontFamily}. Ensure any generic references to colors use these settings or 'var(--primary)'.]\n\nUser Request: ${userMessage.content}`;

      const body = actualVersionId
        ? {
            intent: richIntent,
            versionId: actualVersionId,
            projectId: projectId ?? undefined,
          }
        : {
            intent: richIntent,
            projectId: projectId ?? undefined,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await parseApiResponse<{
        success: true;
        data: Version;
      }>(response);

      const data = result.data;

      const assistantMessage: Message = {
        role: 'assistant',
        content: `${data.explanation}\n\nReasoning: ${data.plan.reasoning}${data.plan.constraint_notice ? `\n\n${data.plan.constraint_notice}` : ''}`,
        diffMode,
        plan: data.plan,
        code: data.code,
        newPlan: diffMode === 'modify' ? data.plan : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onNewVersion(data);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? err.message
              : 'Something went wrong while generating the interface.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(10, 10, 12, 0.98), rgba(3, 7, 18, 0.98))',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gap: '14px',
          flexShrink: 0,
          background:
            'radial-gradient(circle at top left, rgba(168, 85, 247, 0.16), transparent 36%), rgba(10, 10, 12, 0.96)',
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
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  boxShadow: '0 12px 34px rgba(99, 102, 241, 0.35)',
                }}
              >
                <Sparkles size={15} color="#ffffff" />
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 850,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.68)',
                }}
              >
                Aether Architect
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '18px',
                letterSpacing: '-0.035em',
                lineHeight: 1.2,
              }}
            >
              {mode === 'modify' ? 'Refine the current UI' : 'Generate a new interface'}
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                color: '#94a3b8',
                fontSize: '12px',
                lineHeight: 1.55,
              }}
            >
              {mode === 'modify'
                ? `Editing version ${currentVersionId}. Ask for layout, content, spacing, or style changes.`
                : 'Describe a product screen and Aether will generate a complete React interface.'}
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '999px',
              background:
                mode === 'modify'
                  ? 'rgba(59, 130, 246, 0.12)'
                  : 'rgba(168, 85, 247, 0.12)',
              border:
                mode === 'modify'
                  ? '1px solid rgba(59, 130, 246, 0.24)'
                  : '1px solid rgba(168, 85, 247, 0.24)',
              color: mode === 'modify' ? '#93c5fd' : '#d8b4fe',
              fontSize: '11px',
              fontWeight: 850,
              whiteSpace: 'nowrap',
            }}
          >
            {mode === 'modify' ? <PencilLine size={12} /> : <Wand2 size={12} />}
            {mode === 'modify' ? 'Modify Mode' : 'Generate Mode'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {suggestions.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => setInput(suggestion)}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.045)',
                color: '#cbd5e1',
                borderRadius: '999px',
                padding: '7px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.55 : 1,
              }}
            >
              {suggestion.length > 42 ? `${suggestion.slice(0, 42)}...` : suggestion}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'chatMessageIn 220ms ease both',
            }}
          >
            <div
              style={{
                maxWidth: '92%',
                padding: '13px 14px',
                borderRadius: '18px',
                borderTopRightRadius: m.role === 'user' ? 5 : '18px',
                borderTopLeftRadius: m.role === 'assistant' ? 5 : '18px',
                fontSize: '13px',
                lineHeight: 1.65,
                background:
                  m.role === 'user'
                    ? 'linear-gradient(135deg, #9333ea, #6366f1)'
                    : m.isError
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(255, 255, 255, 0.055)',
                border:
                  m.role === 'assistant'
                    ? m.isError
                      ? '1px solid rgba(239, 68, 68, 0.24)'
                      : '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                color: m.isError ? '#fecaca' : 'rgba(255, 255, 255, 0.92)',
                whiteSpace: 'pre-wrap',
                boxShadow:
                  m.role === 'user'
                    ? '0 12px 34px rgba(99, 102, 241, 0.22)'
                    : '0 12px 30px rgba(0, 0, 0, 0.16)',
              }}
            >
              {m.isError && (
                <AlertCircle
                  size={16}
                  style={{
                    marginBottom: '8px',
                    opacity: 0.75,
                  }}
                />
              )}

              <div>{m.content}</div>

              {m.role === 'assistant' && !m.isError && m.diffMode === 'create' && m.plan && (
                <DiffViewer
                  mode="create"
                  plan={m.plan}
                  code={m.code}
                />
              )}

              {m.role === 'assistant' && !m.isError && m.diffMode === 'modify' && m.newPlan && (
                <DiffViewer
                  mode="modify"
                  newPlan={m.newPlan}
                />
              )}
            </div>

            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.28)',
                marginTop: '5px',
                padding: '0 5px',
              }}
            >
              {m.role === 'user' ? 'You' : 'Aether'}
            </span>
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '11px 13px',
              borderRadius: '16px',
              borderTopLeftRadius: 5,
              background: 'rgba(168, 85, 247, 0.09)',
              border: '1px solid rgba(168, 85, 247, 0.18)',
              color: '#d8b4fe',
              fontSize: '12px',
              fontWeight: 750,
            }}
          >
            <Loader2 size={14} className="spin-slow" />
            {mode === 'modify'
              ? 'Refining the current interface...'
              : 'Planning and generating the interface...'}
          </div>
        )}
      </div>

      <div
  style={{
    padding: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(8, 9, 14, 0.98)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
  }}
>
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            padding: '1px',
            background:
              input.trim() || loading
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.65), rgba(99, 102, 241, 0.36))'
                : 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <textarea
            style={{
              width: '100%',
              minHeight: '72px',
maxHeight: '110px',
              resize: 'none',
              borderRadius: '15px',
              border: 'none',
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#ffffff',
              padding: '13px 50px 13px 15px',
              fontSize: '13px',
              lineHeight: 1.55,
              outline: 'none',
              display: 'block',
            }}
            placeholder={
              mode === 'modify'
                ? 'Ask Aether to refine this UI...'
                : 'Describe the interface you want to build...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              position: 'absolute',
              right: '11px',
              bottom: '11px',
              width: '34px',
              height: '34px',
              borderRadius: '12px',
              border: 'none',
              background:
                loading || !input.trim()
                  ? 'rgba(168, 85, 247, 0.35)'
                  : 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: '#ffffff',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'grid',
              placeItems: 'center',
              boxShadow:
                loading || !input.trim()
                  ? 'none'
                  : '0 12px 30px rgba(99, 102, 241, 0.35)',
            }}
          >
            {loading ? <Loader2 size={16} className="spin-slow" /> : <Send size={16} />}
          </button>
        </div>

        <p
          style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.32)',
            margin: '11px 0 0',
            textAlign: 'center',
          }}
        >
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};