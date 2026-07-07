"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import HistorySidebar from '@/components/HistorySidebar';
import { ThemeSettings } from '@/components/ThemeSettings';
import { ProjectSelector } from '@/components/ProjectSelector';
import { AppStateProvider } from '@/lib/state/appState';
import { Version } from '@/types/plan';
import { Project } from '@/types/project';

const CURRENT_PROJECT_STORAGE_KEY = 'aether_current_project_id';

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const fetchHistory = useCallback(async (
    projectId?: number,
    options?: { loadLatest?: boolean }
  ) => {
    try {
      const query = projectId ? `?projectId=${projectId}` : '';

      const res = await fetch(`/api/history${query}`, {
        cache: 'no-store',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch history');
      }

      const loadedHistory: Version[] = result.data.history || [];
      setHistory(loadedHistory);

      if (options?.loadLatest) {
        const latestVersion = loadedHistory[loadedHistory.length - 1];

        if (latestVersion) {
          setVersion(latestVersion);
          setCode(latestVersion.code);
        } else {
          setVersion(null);
          setCode(INITIAL_CODE);
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setHistory([]);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', {
        cache: 'no-store',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch projects');
      }

      const loadedProjects: Project[] = result.data.projects || [];
      setProjects(loadedProjects);

      if (!currentProject && loadedProjects.length > 0) {
        const savedProjectId = Number(window.localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY));

        const savedProject = loadedProjects.find((project) => project.id === savedProjectId);
        const fallbackProject = loadedProjects[0];
        const projectToOpen = savedProject || fallbackProject;

        setCurrentProject(projectToOpen);
        window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(projectToOpen.id));

        await fetchHistory(projectToOpen.id, { loadLatest: true });
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, [currentProject, fetchHistory]);

  const handleCreateProject = async (name: string) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create project');
    }

    const project: Project = result.data.project;

    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(project.id));

    setVersion(null);
    setCode(INITIAL_CODE);
    setHistory([]);
  };

  const handleRenameProject = async (projectId: number, name: string) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to rename project');
    }

    const updatedProject: Project = result.data.project;

    setProjects((prev) =>
      prev.map((project) => project.id === projectId ? updatedProject : project)
    );

    setCurrentProject((prev) =>
      prev?.id === projectId ? updatedProject : prev
    );
  };

  const handleDeleteProject = async (projectId: number) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete project');
    }

    const remainingProjects = projects.filter((project) => project.id !== projectId);

    setProjects(remainingProjects);

    const nextProject = remainingProjects[0] || null;

    setCurrentProject(nextProject);

    if (nextProject) {
      window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(nextProject.id));
    } else {
      window.localStorage.removeItem(CURRENT_PROJECT_STORAGE_KEY);
    }

    setVersion(null);
    setCode(INITIAL_CODE);

    if (nextProject) {
      await fetchHistory(nextProject.id, { loadLatest: true });
    } else {
      setHistory([]);
    }
  };

  const handleSelectProject = async (project: Project) => {
    window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(project.id));

    setCurrentProject(project);
    setVersion(null);
    setCode(INITIAL_CODE);

    await fetchHistory(project.id, { loadLatest: true });
  };

  const handleNewVersion = (v: Version) => {
    setVersion(v);
    setCode(v.code);

    setHistory((prev) => {
      const alreadyExists = prev.some((item) => item.id === v.id);

      if (alreadyExists) {
        return prev.map((item) => item.id === v.id ? v : item);
      }

      return [...prev, v];
    });

    if (currentProject?.id) {
      window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(currentProject.id));
      fetchHistory(currentProject.id);
      fetchProjects();
    }
  };

  const handleDeleteVersion = async (id: number) => {
  if (!currentProject?.id) {
    return;
  }

  const confirmed = window.confirm(`Delete version v${id}?`);

  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/versions/${id}?projectId=${currentProject.id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.error?.message || 'Failed to delete version');
    return;
  }

  const remainingHistory = history.filter((item) => item.id !== id);
  setHistory(remainingHistory);

  if (version?.id === id) {
    const latestVersion = remainingHistory[remainingHistory.length - 1];

    if (latestVersion) {
      setVersion(latestVersion);
      setCode(latestVersion.code);
    } else {
      setVersion(null);
      setCode(INITIAL_CODE);
    }
  }

  fetchHistory(currentProject.id);
  fetchProjects();
};

  const handleRollback = async (id: number) => {
    try {
      const response = await fetch('/api/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          projectId: currentProject?.id ?? undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Rollback failed');
      }

      const restoredVersion = result.data.version;

      setVersion(restoredVersion);
      setCode(restoredVersion.code);

      if (currentProject?.id) {
        fetchHistory(currentProject.id);
      }
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
            <ProjectSelector
              projects={projects}
              currentProjectId={currentProject?.id || null}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onRenameProject={handleRenameProject}
              onDeleteProject={handleDeleteProject}
            />

            <ThemeSettings />

            <ChatPanel
              onNewVersion={handleNewVersion}
              currentVersionId={version?.id ?? undefined}
              projectId={currentProject?.id || null}
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
             onDeleteVersion={handleDeleteVersion}
             isOpen={isHistoryOpen}
             onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          />
        </div>
      </main>
    </AppStateProvider>
  );
}