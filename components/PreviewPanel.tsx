"use client";

import React from 'react';
import JSZip from 'jszip';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  Loader2,
  Monitor,
  Package,
  RotateCcw,
  Save,
} from 'lucide-react';
import * as UI from './ui';
import { useAppState, useDataFetch } from '@/lib/state/appState';
import { MOCK_DATA } from '@/lib/mock/dataGenerator';
import { ErrorBoundary } from './ErrorBoundary';
import { Version } from '@/types/plan';
import { parseApiResponse } from '@/lib/client/apiClient';

interface PreviewPanelProps {
  code: string;
  projectId?: number;
  onManualVersionSaved?: (version: Version) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  code,
  projectId,
  onManualVersionSaved,
}) => {
  const { state } = useAppState();
  const { themeConfig } = state;
  const [mode, setMode] = React.useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = React.useState(false);
  const [editableCode, setEditableCode] = React.useState(code);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const sanitizeCode = (value: string) => value.replace(/^import\s+.*?;?\s*$/gm, '').trim();

  const sanitizedCode = sanitizeCode(editableCode);
  const hasCode = Boolean(sanitizedCode);
  const hasUnsavedChanges = editableCode !== code;

  const getComponentCode = () => `"use client";

import React from 'react';

const GeneratedComponent = ${sanitizedCode};

export default GeneratedComponent;
`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sanitizedCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy code:', error);
      alert('Failed to copy code.');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([getComponentCode()], {
      type: 'text/plain;charset=utf-8',
    });

    downloadBlob(blob, 'GeneratedComponent.tsx');
  };

  const handleExportZip = async () => {
    if (!sanitizedCode) {
      alert('No code available to export.');
      return;
    }

    setIsExporting(true);

    try {
      const zip = new JSZip();

      zip.file('GeneratedComponent.tsx', getComponentCode());

      zip.file('README.md', `# Aether Generated Component

This package was exported from Aether, an AI-powered React UI generation workspace.

## Files

- \`GeneratedComponent.tsx\` - The generated React component.
- \`package.json\` - Minimal dependency metadata.

## Usage

Import the component into your React or Next.js project:

\`\`\`tsx
import GeneratedComponent from './GeneratedComponent';

export default function Page() {
  return <GeneratedComponent />;
}
\`\`\`

## Notes

The component was generated as a client-side React component and may depend on UI primitives from the original Aether workspace if custom components were used.
`);

      zip.file('package.json', JSON.stringify({
        name: 'aether-generated-component',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          '@types/react': 'latest',
          '@types/react-dom': 'latest',
          next: 'latest',
          react: 'latest',
          'react-dom': 'latest',
          typescript: 'latest',
        },
      }, null, 2));

      const blob = await zip.generateAsync({
        type: 'blob',
      });

      downloadBlob(blob, 'aether-generated-component.zip');
    } catch (error) {
      console.error('Failed to export ZIP:', error);
      alert('Failed to export ZIP.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetCode = () => {
    setEditableCode(code);
  };

  const handleSaveManualVersion = async () => {
    if (!projectId) {
      alert('Select a project before saving code.');
      return;
    }

    if (!sanitizedCode) {
      alert('Code is empty.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/versions/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          code: sanitizedCode,
          explanation: 'Saved manual code edit from live editor.',
        }),
      });

      const result = await parseApiResponse<{
        success: true;
        data: {
          version: Version;
        };
      }>(response);

      const savedVersion: Version = result.data.version;

      onManualVersionSaved?.(savedVersion);
      setMode('preview');
    } catch (error) {
      console.error('Failed to save manual version:', error);
      alert(error instanceof Error ? error.message : 'Failed to save manual version.');
    } finally {
      setIsSaving(false);
    }
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '9px 11px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#e2e8f0',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        flex: 1.2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 32%), #020617',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '18px 90px 18px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.92)',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
              boxShadow: '0 14px 32px rgba(20, 184, 166, 0.25)',
              flexShrink: 0,
            }}
          >
            <Monitor size={17} color="#ffffff" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 18px rgba(74, 222, 128, 0.7)',
                }}
              />

              <span
                style={{
                  fontSize: '11px',
                  color: '#86efac',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Live Workspace
              </span>
            </div>

            <h2
              style={{
                fontSize: '18px',
                margin: 0,
                color: '#f8fafc',
                fontWeight: 950,
                letterSpacing: '-0.04em',
              }}
            >
              {mode === 'preview' ? 'Visual Preview' : 'Source Editor'}
            </h2>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {mode === 'code' && (
            <>
              <button
                type="button"
                onClick={handleResetCode}
                disabled={!hasUnsavedChanges}
                style={{
                  ...actionButtonStyle,
                  color: hasUnsavedChanges ? '#e2e8f0' : '#64748b',
                  cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                }}
              >
                <RotateCcw size={14} />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSaveManualVersion}
                disabled={isSaving || !sanitizedCode || !hasUnsavedChanges}
                style={{
                  ...actionButtonStyle,
                  border: '1px solid rgba(34, 197, 94, 0.28)',
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: isSaving ? '#86efac' : '#bbf7d0',
                  cursor:
                    isSaving || !sanitizedCode || !hasUnsavedChanges
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {isSaving ? <Loader2 size={14} className="spin-slow" /> : <Save size={14} />}
                {isSaving ? 'Saving' : 'Save'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!hasCode}
            style={{
              ...actionButtonStyle,
              background: copied ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.06)',
              color: copied ? '#86efac' : '#e2e8f0',
              cursor: hasCode ? 'pointer' : 'not-allowed',
              opacity: hasCode ? 1 : 0.55,
            }}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={handleDownloadCode}
            disabled={!hasCode}
            style={{
              ...actionButtonStyle,
              cursor: hasCode ? 'pointer' : 'not-allowed',
              opacity: hasCode ? 1 : 0.55,
            }}
          >
            <Download size={14} />
            Download
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            disabled={!hasCode || isExporting}
            style={{
              ...actionButtonStyle,
              border: '1px solid rgba(59, 130, 246, 0.26)',
              background: 'rgba(59, 130, 246, 0.1)',
              color: isExporting ? '#93c5fd' : '#bfdbfe',
              cursor: !hasCode || isExporting ? 'not-allowed' : 'pointer',
              opacity: hasCode ? 1 : 0.55,
            }}
          >
            {isExporting ? <Loader2 size={14} className="spin-slow" /> : <Package size={14} />}
            {isExporting ? 'Exporting' : 'ZIP'}
          </button>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              gap: '4px',
              background: 'rgba(2, 6, 23, 0.82)',
              padding: '5px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '5px',
                bottom: '5px',
                left: mode === 'preview' ? '5px' : '87px',
                width: mode === 'preview' ? '78px' : '98px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                transition: 'left 220ms ease, width 220ms ease',
                zIndex: 0,
              }}
            />

            <button
              type="button"
              onClick={() => setMode('preview')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '7px 12px',
                width: '78px',
                borderRadius: '999px',
                border: 'none',
                background: 'transparent',
                color: mode === 'preview' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Eye size={13} />
              Visual
            </button>

            <button
              type="button"
              onClick={() => setMode('code')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '7px 12px',
                width: '98px',
                borderRadius: '999px',
                border: 'none',
                background: 'transparent',
                color: mode === 'code' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Code2 size={13} />
              Code
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '26px',
          position: 'relative',
          background:
            'radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 35%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.09), transparent 32%), #020617',
        }}
      >
        {mode === 'preview' ? (
          <LiveProvider
            code={sanitizedCode}
            scope={{
              ...UI,
              useAppState,
              useDataFetch,
              MOCK_DATA,
              React,
              useEffect: React.useEffect,
              useState: React.useState,
            }}
            noInline={false}
          >
            <div
              style={{
                maxWidth: '1320px',
                margin: '0 auto',
                padding: '12px',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.74)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                boxShadow: '0 28px 90px rgba(0, 0, 0, 0.38)',
                animation: 'panelReveal 180ms ease both',
              }}
            >
              <div
                style={{
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px 10px',
                  color: '#64748b',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: '#ef4444' }} />
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: '#f59e0b' }} />
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: '#22c55e' }} />
                </div>

                <span>Aether Preview Canvas</span>
              </div>

              <div
                style={{
                  minHeight: 'calc(100vh - 190px)',
                  width: '100%',
                  background:
                    themeConfig.theme === 'dark'
                      ? 'linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%)'
                      : '#ffffff',
                  color: themeConfig.theme === 'dark' ? '#f8fafc' : '#0f172a',
                  fontFamily: themeConfig.fontFamily,
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '32px',
                  overflow: 'auto',
                  '--primary': themeConfig.primaryColor,
                  '--secondary': themeConfig.secondaryColor,
                } as React.CSSProperties}
              >
                <ErrorBoundary>
                  <LivePreview />
                </ErrorBoundary>
              </div>
            </div>

            <div
              style={{
                position: 'sticky',
                bottom: '0px',
                marginTop: '16px',
                maxWidth: '1320px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <LiveError
                style={{
                  color: '#fecaca',
                  fontSize: '12px',
                  margin: 0,
                  padding: '13px 14px',
                  background: 'rgba(127, 29, 29, 0.88)',
                  border: '1px solid rgba(248, 113, 113, 0.22)',
                  borderRadius: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </div>
          </LiveProvider>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: '620px',
              background: 'rgba(15, 23, 42, 0.86)',
              borderRadius: '22px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 28px 90px rgba(0, 0, 0, 0.35)',
              animation: 'panelReveal 180ms ease both',
            }}
          >
            <div
              style={{
                padding: '13px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                background: 'rgba(2, 6, 23, 0.72)',
              }}
            >
              <span>GeneratedComponent.tsx</span>
              <span>{hasUnsavedChanges ? 'Unsaved changes' : 'Synced with preview'}</span>
            </div>

            <textarea
              value={editableCode}
              onChange={(event) => setEditableCode(event.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                minHeight: '540px',
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: '#020617',
                color: '#e2e8f0',
                padding: '22px',
                fontSize: '13px',
                lineHeight: 1.75,
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                whiteSpace: 'pre',
                overflow: 'auto',
              }}
            />

            <p
              style={{
                margin: 0,
                padding: '13px 16px',
                fontSize: '12px',
                color: '#94a3b8',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.92)',
              }}
            >
              Edit the generated React arrow component here. Switch to Visual to preview changes, then Save to store it in history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};