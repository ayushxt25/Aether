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

            const data = await response.json();
            if (data.error) throw new Error(data.error);

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
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Architect Chat</span>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-medium">
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-ping" />
                        Thinking...
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : m.isError
                                ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                            }`}>
                            {m.isError && <AlertCircle className="w-4 h-4 mb-2 opacity-50" />}
                            <div className="whitespace-pre-wrap">{m.content}</div>

                            {/* DiffViewer for assistant messages with diff data */}
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
                        <span className="text-[10px] text-white/20 mt-1 px-1">
                            {m.role === 'user' ? 'You' : 'Architect'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#0d0d0d]">
                <div className="relative group">
                    <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all resize-none min-h-[100px]"
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
                        className="absolute bottom-3 right-3 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 disabled:opacity-30 disabled:hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-white/20 mt-3 text-center">
                    Shift + Enter for new line · Editing v{currentVersionId || 'new'}
                </p>
            </div>
        </div>
    );
};
