'use client';

import React, { useState } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, Check, X, Layers } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId: number | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => Promise<void>;
  onRenameProject: (projectId: number, name: string) => Promise<void>;
  onDeleteProject: (projectId: number) => Promise<void>;
}

export function ProjectSelector({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProject = projects.find((project) => project.id === currentProjectId);

  const buttonBaseStyle: React.CSSProperties = {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#e2e8f0',
    borderRadius: '12px',
    padding: '9px 11px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    background: 'rgba(2, 6, 23, 0.92)',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '11px 12px',
    outline: 'none',
    fontSize: '13px',
    fontWeight: 600,
  };

  const handleCreate = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateProject(trimmedName);
      setProjectName('');
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRename = () => {
    if (!currentProject) {
      return;
    }

    setRenameValue(currentProject.name);
    setIsRenaming(true);
    setIsCreating(false);
  };

  const handleRename = async () => {
    const trimmedName = renameValue.trim();

    if (!currentProject || !trimmedName) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onRenameProject(currentProject.id, trimmedName);
      setRenameValue('');
      setIsRenaming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProject) {
      return;
    }

    const confirmed = window.confirm(`Delete "${currentProject.name}" and all its versions?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteProject(currentProject.id);
      setIsRenaming(false);
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background:
          'radial-gradient(circle at top left, rgba(168, 85, 247, 0.14), transparent 38%), rgba(8, 10, 18, 0.98)',
      }}
    >
      <div
        style={{
          padding: '14px',
          borderRadius: '20px',
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: '0 18px 55px rgba(0, 0, 0, 0.22)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '13px',
          }}
        >
          <div style={{ minWidth: 0 }}>
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
                  width: '30px',
                  height: '30px',
                  borderRadius: '11px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  boxShadow: '0 12px 30px rgba(99, 102, 241, 0.32)',
                }}
              >
                <FolderKanban size={15} color="#ffffff" />
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
                Workspace
              </div>
            </div>

            <div
              style={{
                fontSize: '17px',
                fontWeight: 950,
                color: '#f8fafc',
                maxWidth: '245px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.035em',
              }}
              title={currentProject?.name || 'No project selected'}
            >
              {currentProject?.name || 'No project selected'}
            </div>

            <div
              style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 650,
              }}
            >
              <Layers size={12} />
              {projects.length === 0
                ? 'Create your first project'
                : `${projects.length} project${projects.length === 1 ? '' : 's'} available`}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCreating((value) => !value);
              setIsRenaming(false);
            }}
            style={{
              ...buttonBaseStyle,
              border: '1px solid rgba(168, 85, 247, 0.35)',
              background: isCreating
                ? 'rgba(168, 85, 247, 0.2)'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.32), rgba(99, 102, 241, 0.18))',
              color: '#f5f3ff',
              boxShadow: isCreating ? 'none' : '0 12px 30px rgba(99, 102, 241, 0.18)',
            }}
          >
            {isCreating ? <X size={14} /> : <Plus size={14} />}
            {isCreating ? 'Close' : 'New'}
          </button>
        </div>

        <select
          value={currentProjectId ?? ''}
          onChange={(event) => {
            const selectedId = Number(event.target.value);
            const selectedProject = projects.find((project) => project.id === selectedId);

            if (selectedProject) {
              onSelectProject(selectedProject);
              setIsCreating(false);
              setIsRenaming(false);
            }
          }}
          style={{
            width: '100%',
            background: 'rgba(2, 6, 23, 0.78)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '11px 12px',
            outline: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: projects.length === 0 ? 'not-allowed' : 'pointer',
            opacity: projects.length === 0 ? 0.72 : 1,
          }}
          disabled={projects.length === 0}
        >
          {projects.length === 0 && <option value="">No projects yet</option>}

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} {project._count ? `(${project._count.versions})` : ''}
            </option>
          ))}
        </select>

        <div
          style={{
            marginTop: '10px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={handleStartRename}
            disabled={!currentProject || isSubmitting}
            style={{
              ...buttonBaseStyle,
              cursor: currentProject && !isSubmitting ? 'pointer' : 'not-allowed',
              opacity: currentProject ? 1 : 0.45,
            }}
          >
            <Pencil size={13} />
            Rename
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!currentProject || isSubmitting}
            style={{
              ...buttonBaseStyle,
              color: '#fecaca',
              border: '1px solid rgba(248, 113, 113, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              cursor: currentProject && !isSubmitting ? 'pointer' : 'not-allowed',
              opacity: currentProject ? 1 : 0.45,
            }}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>

        {isCreating && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.045)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
              animation: 'panelReveal 180ms ease both',
            }}
          >
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Project name"
              style={inputStyle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreate();
                }
              }}
            />

            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting || !projectName.trim()}
              style={{
                border: 'none',
                background: projectName.trim()
                  ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                  : '#334155',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '10px 12px',
                cursor: projectName.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              Add
            </button>
          </div>
        )}

        {isRenaming && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.045)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
              animation: 'panelReveal 180ms ease both',
            }}
          >
            <input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder="New project name"
              style={inputStyle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleRename();
                }
              }}
            />

            <button
              type="button"
              onClick={handleRename}
              disabled={isSubmitting || !renameValue.trim()}
              style={{
                border: 'none',
                background: renameValue.trim()
                  ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                  : '#334155',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '10px 12px',
                cursor: renameValue.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}