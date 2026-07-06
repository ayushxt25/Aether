"use client";

import React, { useState, useEffect } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import HistorySidebar from '@/components/HistorySidebar';
import { ThemeSettings } from '@/components/ThemeSettings';
import { AppStateProvider } from '@/lib/state/appState';
import { Version } from '@/types/plan';

const INITIAL_CODE = `
() => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Navbar title="Welcome to AI UI Architect" />
      <div style={{ display: 'flex', gap: '20px' }}>
        <Sidebar>
          <Button label="Dashboard" variant="primary" onClick={() => alert('Dashboard Clicked')} />
          <Button label="Settings" variant="secondary" onClick={() => alert('Settings Clicked')} />
        </Sidebar>
        <Card title="Get Started">
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
            Describe what you want to build in the chat panel to the left.
          </p>
          <Button label="Learn More" variant="primary" onClick={() => alert('Learning More...')} />
        </Card>
      </div>
    </div>
  );
}
`;

export default function Home() {
  const [version, setVersion] = useState<Version | null>(null);
  const [history, setHistory] = useState<Version[]>([]);
  const [code, setCode] = useState(INITIAL_CODE);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleNewVersion = (v: Version) => {
    setVersion(v);
    setCode(v.code);
    fetchHistory();
  };

  const handleRollback = async (id: number) => {
    try {
      const response = await fetch('/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setVersion(data.version);
      setCode(data.version.code);
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
   <AppStateProvider>
    <main
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <aside
          style={{
            width: '400px',
            minWidth: '400px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#0a0a0a',
          }}
        >
          <ThemeSettings />
          <ChatPanel
            onNewVersion={handleNewVersion}
            currentVersionId={version?.id ?? undefined}
          />
        </aside>

        <section
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <PreviewPanel code={code} />
        </section>

        <HistorySidebar
          history={history}
          currentId={version?.id || null}
          onRollback={handleRollback}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        />
      </div>
    </main>
  </AppStateProvider>
);
}
