'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state/appState';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { Version } from '@/types/plan';
import { DiffViewer } from './DiffViewer';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isError?: boolean;
    // Metadata for DiffViewer
    diffMode?: 'create' | 'modify';
    plan?: any;
    oldPlan?: any;
    newPlan?: any;
    code?: string;
}

interface ChatPanelProps {
    onNewVersion: (version: Version) => void;
    currentVersionId?: number;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onNewVersion, currentVersionId }) => {
    const { state } = useAppState();
    const { themeConfig } = state;

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your AI UI Architect. Describe what you'd like to build and I'll generate it instantly." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setInput('');

        try {
            const isFreshIntent = input.toLowerCase().includes('build') ||
                input.toLowerCase().includes('create') ||
                input.toLowerCase().includes('design') ||
                input.toLowerCase().includes('clone');

            const actualVersionId = isFreshIntent ? undefined : currentVersionId;
            const endpoint = actualVersionId ? '/api/modify' : '/api/generate';
            const diffMode: 'create' | 'modify' = actualVersionId ? 'modify' : 'create';

            const richIntent = `[CONTEXT: The current UI theme is ${themeConfig.theme}, with primary color ${themeConfig.primaryColor}, secondary color ${themeConfig.secondaryColor}, and font ${themeConfig.fontFamily}. Ensure any generic references to colors use these settings or 'var(--primary)'.]\\n\\nUser Request: ${userMessage.content}`;

            const body = actualVersionId
                ? { intent: richIntent, versionId: actualVersionId }
                : { intent: richIntent };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

           const result = await response.json();

           if (!result.success) {
               throw new Error(result.error?.message || 'Request failed');
            }

            const data = result.data;

            const assistantMessage: Message = {
                role: 'assistant',
                content: `${data.explanation}\n\n**Reasoning:** ${data.plan.reasoning}${data.plan.constraint_notice ? `\n\n*${data.plan.constraint_notice}*` : ''}`,
                diffMode,
                plan: data.plan,
                code: data.code,
                // For modify mode, oldPlan comes from previous version
                newPlan: diffMode === 'modify' ? data.plan : undefined,
            };

            setMessages(prev => [...prev, assistantMessage]);
            onNewVersion(data);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${err.message}`,
                isError: true
            }]);
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
            background: '#0a0a0a',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
    >
        {/* Header */}
        <div
            style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#c084fc" />
                <span
                    style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'rgba(255, 255, 255, 0.6)',
                    }}
                >
                    Architect Chat
                </span>
            </div>

            {loading && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '10px',
                        color: '#c084fc',
                        fontWeight: 500,
                    }}
                >
                    Thinking...
                </div>
            )}
        </div>

        {/* Messages */}
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
                    key={i}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '90%',
                            padding: '12px',
                            borderRadius: '16px',
                            borderTopRightRadius: m.role === 'user' ? 0 : '16px',
                            borderTopLeftRadius: m.role === 'assistant' ? 0 : '16px',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            background: m.role === 'user'
                                ? '#9333ea'
                                : m.isError
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : 'rgba(255, 255, 255, 0.05)',
                            border: m.role === 'assistant'
                                ? m.isError
                                    ? '1px solid rgba(239, 68, 68, 0.2)'
                                    : '1px solid rgba(255, 255, 255, 0.1)'
                                : 'none',
                            color: m.isError ? '#fecaca' : 'rgba(255, 255, 255, 0.9)',
                            whiteSpace: 'pre-wrap',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        {m.isError && <AlertCircle size={16} style={{ marginBottom: '8px', opacity: 0.5 }} />}
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
                            color: 'rgba(255, 255, 255, 0.25)',
                            marginTop: '4px',
                            padding: '0 4px',
                        }}
                    >
                        {m.role === 'user' ? 'You' : 'Architect'}
                    </span>
                </div>
            ))}
        </div>

        {/* Input Area */}
        <div
            style={{
                padding: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#0d0d0d',
                flexShrink: 0,
            }}
        >
            <div style={{ position: 'relative' }}>
                <textarea
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        resize: 'none',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        padding: '12px 48px 12px 16px',
                        fontSize: '14px',
                        outline: 'none',
                    }}
                    placeholder="Ask the architect to build something..."
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
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        bottom: '12px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: loading || !input.trim() ? 'rgba(168, 85, 247, 0.35)' : '#a855f7',
                        color: '#ffffff',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Send size={16} />
                </button>
            </div>

            <p
                style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.25)',
                    marginTop: '12px',
                    textAlign: 'center',
                }}
            >
                Shift + Enter for new line · Editing v{currentVersionId || 'new'}
            </p>
        </div>
    </div>
    );
};
