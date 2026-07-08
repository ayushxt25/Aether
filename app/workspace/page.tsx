  "use client";

  import { UserButton } from '@clerk/nextjs';
  import { parseApiResponse } from '@/lib/client/apiClient';
  import { PromptRunsView } from '@/components/PromptRunsView';
  import { PromptRun } from '@/types/run';
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
  const quickPrompts = [
    'AI finance dashboard',
    'SaaS landing page',
    'Admin analytics panel',
    'Startup CRM workspace'
  ];

  return (
    <div
      style={{
        minHeight: '100%',
        padding: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(168, 85, 247, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 34%), #050711',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
          gap: '22px',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            padding: '34px',
            borderRadius: '28px',
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.36)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '7px 11px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.14)',
              border: '1px solid rgba(168, 85, 247, 0.24)',
              color: '#d8b4fe',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '18px',
            }}
          >
            Aether Workspace
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '46px',
              lineHeight: 1,
              letterSpacing: '-0.06em',
              color: '#ffffff',
            }}
          >
            Generate your first polished React interface.
          </h1>

          <p
            style={{
              margin: '18px 0 0',
              color: '#94a3b8',
              fontSize: '15px',
              lineHeight: 1.8,
              maxWidth: '620px',
            }}
          >
            Create a project, describe the UI you want, preview the generated
            component, edit the code, track every version, and export the final
            result as a reusable React component.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '24px',
            }}
          >
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => alert('Try this prompt in the chat: ' + prompt)}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.055)',
                  color: '#e2e8f0',
                  borderRadius: '999px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          {[
            ['1', 'Create a project', 'Keep related UI generations organized.'],
            ['2', 'Describe the interface', 'Use natural language prompts to generate React UIs.'],
            ['3', 'Edit and version', 'Modify, duplicate, fork, restore, or manually save code.'],
            ['4', 'Export component', 'Download the final UI as code or a ZIP package.']
          ].map(([step, title, text]) => (
            <div
              key={step}
              style={{
                padding: '18px',
                borderRadius: '20px',
                background: 'rgba(15, 23, 42, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '13px',
                  marginBottom: '12px',
                }}
              >
                {step}
              </div>

              <div
                style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 900,
                  marginBottom: '5px',
                }}
              >
                {title}
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
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
    const [activeView, setActiveView] = useState<'workspace' | 'runs'>('workspace');
    const [runs, setRuns] = useState<PromptRun[]>([]);
    const [isRunsLoading, setIsRunsLoading] = useState(false);

    const fetchHistory = useCallback(async (
      projectId?: number,
      options?: { loadLatest?: boolean }
    ) => {
      try {
        const query = projectId ? `?projectId=${projectId}` : '';

        const res = await fetch(`/api/history${query}`, {
          cache: 'no-store',
        });

        const result = await parseApiResponse<{
  success: true;
  data: {
    history: Version[];
  };
}>(res);

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

        const result = await parseApiResponse<{
  success: true;
  data: {
    projects: Project[];
  };
}>(res);

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

    const fetchRuns = useCallback(async () => {
    setIsRunsLoading(true);

    try {
      const res = await fetch('/api/runs', {
        cache: 'no-store',
      });

      const result = await parseApiResponse<{
  success: true;
  data: {
    runs: PromptRun[];
  };
}>(res);

setRuns(result.data.runs || []);
    } catch (error) {
      console.error('Failed to fetch prompt runs:', error);
      setRuns([]);
    } finally {
      setIsRunsLoading(false);
    }
  }, []);

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

      const result = await parseApiResponse<{
  success: true;
  data: {
    project: Project;
  };
}>(res);

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

      const result = await parseApiResponse<{
  success: true;
  data: {
    project: Project;
  };
}>(res);

const updatedProject: Project = result.data.project;
      setProjects((prev) =>
        prev.map((project) => project.id === projectId ? updatedProject : project)
      );

      setCurrentProject((prev) =>
        prev?.id === projectId ? updatedProject : prev
      );
    };

    const handleOpenRun = async (run: PromptRun) => {
    const targetProject = projects.find((project) => project.id === run.projectId) || {
      id: run.projectId,
      name: run.projectName,
      description: '',
      createdAt: run.timestamp,
      updatedAt: run.timestamp,
    };

    setCurrentProject(targetProject);
    window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(run.projectId));

    setVersion({
      id: run.versionId,
      versionNo: run.versionNo,
      prompt: run.prompt,
      source: run.source,
      plan: run.plan,
      code: run.code,
      explanation: run.explanation,
      timestamp: run.timestamp,
    });

    setCode(run.code);
    setActiveView('workspace');

    await fetchHistory(run.projectId);
  };

  const handleDuplicateRun = async (run: PromptRun) => {
    const response = await fetch(`/api/versions/${run.versionId}/duplicate?projectId=${run.projectId}`, {
      method: 'POST',
    });

    try {
  await parseApiResponse<{
    success: true;
    data: unknown;
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to duplicate run');
  return;
}

    await fetchRuns();

    if (currentProject?.id === run.projectId) {
      await fetchHistory(run.projectId);
    }
  };

  const handleForkRun = async (run: PromptRun) => {
    const projectName = window.prompt('Name for the forked project');

    const response = await fetch(`/api/versions/${run.versionId}/fork`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: projectName?.trim() || undefined,
      }),
    });

    try {
  await parseApiResponse<{
    success: true;
    data: unknown;
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to fork run');
  return;
}

    await fetchProjects();
    await fetchRuns();
  };

  const handleDeleteRun = async (run: PromptRun) => {
    const confirmed = window.confirm(`Delete ${run.projectName} v${run.versionNo || run.versionId}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/versions/${run.versionId}?projectId=${run.projectId}`, {
      method: 'DELETE',
    });

    try {
  await parseApiResponse<{
    success: true;
    data: unknown;
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to delete run');
  return;
}

    setRuns((prev) => prev.filter((item) => item.versionId !== run.versionId));

    if (currentProject?.id === run.projectId) {
      await fetchHistory(run.projectId);

      if (version?.id === run.versionId) {
        setVersion(null);
        setCode(INITIAL_CODE);
      }
    }
  };

    const handleDeleteProject = async (projectId: number) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      await parseApiResponse<{
  success: true;
  data: unknown;
}>(res);

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

    const handleForkVersion = async (id: number) => {
    const projectName = window.prompt('Name for the forked project');

    const response = await fetch(`/api/versions/${id}/fork`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: projectName?.trim() || undefined,
      }),
    });

   let result: {
  success: true;
  data: {
    project: Project;
    version: Version;
  };
};

try {
  result = await parseApiResponse<{
    success: true;
    data: {
      project: Project;
      version: Version;
    };
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to fork version');
  return;
}

const forkedProject: Project = result.data.project;
const forkedVersion: Version = result.data.version;

    setProjects((prev) => [forkedProject, ...prev]);
    setCurrentProject(forkedProject);
    window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(forkedProject.id));

    setVersion(forkedVersion);
    setCode(forkedVersion.code);
    setHistory([forkedVersion]);

    fetchProjects();
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

    try {
  await parseApiResponse<{
    success: true;
    data: unknown;
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to delete version');
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

  const handleDuplicateVersion = async (id: number) => {
    if (!currentProject?.id) {
      return;
    }

    const response = await fetch(`/api/versions/${id}/duplicate?projectId=${currentProject.id}`, {
      method: 'POST',
    });

   let result: {
  success: true;
  data: {
    version: Version;
  };
};

try {
  result = await parseApiResponse<{
    success: true;
    data: {
      version: Version;
    };
  }>(response);
} catch (error) {
  alert(error instanceof Error ? error.message : 'Failed to duplicate version');
  return;
}

const duplicatedVersion: Version = result.data.version;

    setVersion(duplicatedVersion);
    setCode(duplicatedVersion.code);

    setHistory((prev) => [...prev, duplicatedVersion]);

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

        const result = await parseApiResponse<{
  success: true;
  data: {
    version: Version;
  };
}>(response);

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
    fetchRuns();
  }, [fetchProjects, fetchRuns]);

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
          position: 'fixed',
          top: '18px',
          right: '18px',
          zIndex: 200,
          padding: '8px',
          borderRadius: '999px',
          background: 'rgba(15, 23, 42, 0.86)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35)',
        }}
      >
        <UserButton />
      </div>
          <div
  style={{
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    display: 'flex',
    gap: '4px',
    padding: '6px',
    borderRadius: '999px',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 18px 60px rgba(0, 0, 0, 0.45)',
    overflow: 'hidden',
  }}
>
  <div
    style={{
      position: 'absolute',
      top: '6px',
      bottom: '6px',
      left: activeView === 'workspace' ? '6px' : '112px',
      width: activeView === 'workspace' ? '102px' : '116px',
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
      boxShadow: '0 10px 28px rgba(99, 102, 241, 0.36)',
      transition: 'left 220ms ease, width 220ms ease',
      zIndex: 0,
    }}
  />

  <button
    type="button"
    onClick={() => setActiveView('workspace')}
    style={{
      position: 'relative',
      zIndex: 1,
      border: 'none',
      borderRadius: '999px',
      padding: '8px 14px',
      width: '102px',
      background: 'transparent',
      color: activeView === 'workspace' ? '#ffffff' : '#94a3b8',
      fontSize: '13px',
      fontWeight: 850,
      cursor: 'pointer',
      transition: 'color 180ms ease, transform 180ms ease',
    }}
  >
    Workspace
  </button>

  <button
    type="button"
    onClick={() => {
      setActiveView('runs');
      fetchRuns();
    }}
    style={{
      position: 'relative',
      zIndex: 1,
      border: 'none',
      borderRadius: '999px',
      padding: '8px 14px',
      width: '116px',
      background: 'transparent',
      color: activeView === 'runs' ? '#ffffff' : '#94a3b8',
      fontSize: '13px',
      fontWeight: 850,
      cursor: 'pointer',
      transition: 'color 180ms ease, transform 180ms ease',
    }}
  >
    Prompt Runs
  </button>
</div>

          {activeView === 'workspace' ? (
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
                <PreviewPanel
                  code={code}
                  projectId={currentProject?.id}
                  onManualVersionSaved={(savedVersion) => {
                    setVersion(savedVersion);
                    setCode(savedVersion.code);
                    setHistory((prev) => [...prev, savedVersion]);

                    if (currentProject?.id) {
                      fetchHistory(currentProject.id);
                      fetchProjects();
                      fetchRuns();
                    }
                  }}
                />
              </section>

              <HistorySidebar
                history={history}
                currentId={version?.id || null}
                onRollback={handleRollback}
                onDeleteVersion={handleDeleteVersion}
                onDuplicateVersion={handleDuplicateVersion}
                onForkVersion={handleForkVersion}
                isOpen={isHistoryOpen}
                onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
              />
            </div>
          ) : (
            <PromptRunsView
              runs={runs}
              isLoading={isRunsLoading}
              onOpenRun={handleOpenRun}
              onDuplicateRun={handleDuplicateRun}
              onForkRun={handleForkRun}
              onDeleteRun={handleDeleteRun}
              onRefresh={fetchRuns}
            />
          )}
        </main>
      </AppStateProvider>
    );
  }