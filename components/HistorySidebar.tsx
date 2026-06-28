'use client';

import React from 'react';
import { Version } from '@/types/plan';
import { Clock, RotateCcw } from 'lucide-react';

interface HistorySidebarProps {
    history: Version[];
    currentId: number | null;
    onRollback: (id: number) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function HistorySidebar({ history, currentId, onRollback, isOpen, onToggle }: HistorySidebarProps) {
    return (
        <div className={`fixed right-0 top-0 h-full bg-[#0a0a0a] border-l border-white/10 transition-all duration-300 z-50 ${isOpen ? 'w-80' : 'w-0'}`}>
            <button
                onClick={onToggle}
                className="absolute left-0 top-1/2 -translate-x-full bg-[#0a0a0a] border border-white/10 p-2 rounded-l-md hover:bg-white/5"
            >
                <Clock className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`p-6 h-full flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity delay-100`}>
                <div className="flex items-center gap-2 mb-8">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Version History
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {history.slice().reverse().map((version) => (
                        <div
                            key={version.id}
                            className={`group p-4 rounded-xl border transition-all cursor-pointer ${currentId === version.id
                                    ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            onClick={() => onRollback(version.id)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentId === version.id
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-white/10 text-white/40'
                                    }`}>
                                    v{version.id}
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">
                                    {new Date(version.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                                {version.explanation}
                            </p>
                            <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-purple-400 font-medium">Click to restore</span>
                                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="text-center py-12">
                            <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
                            <p className="text-sm text-white/30">No versions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
