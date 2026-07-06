"use client";

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = "Search...",
    value = "",
    onChange
}) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Search
                size={18}
                style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                }}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
        </div>
    );
};