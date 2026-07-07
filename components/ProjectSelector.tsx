'use client';

import React, { useState } from 'react';
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
        border: '1px solid rgba(255, 255, 255, 0.14)',
        background: 'rgba(255, 255, 255, 0.06)',
        color: '#e2e8f0',
        borderRadius: '10px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontSize: '13px',
    };

    const inputStyle: React.CSSProperties = {
        flex: 1,
        background: '#020617',
        color: '#f8fafc',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        padding: '10px',
        outline: 'none',
        fontSize: '14px',
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
                background: '#0a0a0a',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '10px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '4px',
                        }}
                    >
                        Workspace
                    </div>

                    <div
                        style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#f8fafc',
                            maxWidth: '230px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {currentProject?.name || 'No project selected'}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsCreating((value) => !value);
                        setIsRenaming(false);
                    }}
                    style={buttonBaseStyle}
                >
                    New
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
                    background: '#111827',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '10px',
                    outline: 'none',
                    fontSize: '14px',
                }}
            >
                {projects.length === 0 && <option value="">No projects</option>}

                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.name} {project._count ? `(${project._count.versions})` : ''}
                    </option>
                ))}
            </select>

            <div
                style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '8px',
                }}
            >
                <button
                    type="button"
                    onClick={handleStartRename}
                    disabled={!currentProject || isSubmitting}
                    style={{
                        ...buttonBaseStyle,
                        flex: 1,
                        cursor: currentProject && !isSubmitting ? 'pointer' : 'not-allowed',
                        opacity: currentProject ? 1 : 0.5,
                    }}
                >
                    Rename
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!currentProject || isSubmitting}
                    style={{
                        ...buttonBaseStyle,
                        flex: 1,
                        color: '#fecaca',
                        border: '1px solid rgba(248, 113, 113, 0.25)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        cursor: currentProject && !isSubmitting ? 'pointer' : 'not-allowed',
                        opacity: currentProject ? 1 : 0.5,
                    }}
                >
                    Delete
                </button>
            </div>

            {isCreating && (
                <div
                    style={{
                        marginTop: '12px',
                        display: 'flex',
                        gap: '8px',
                    }}
                >
                    <input
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        placeholder="Project name"
                        style={inputStyle}
                    />

                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={isSubmitting || !projectName.trim()}
                        style={{
                            border: 'none',
                            background: projectName.trim() ? '#6366f1' : '#334155',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: projectName.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        Add
                    </button>
                </div>
            )}

            {isRenaming && (
                <div
                    style={{
                        marginTop: '12px',
                        display: 'flex',
                        gap: '8px',
                    }}
                >
                    <input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        placeholder="New project name"
                        style={inputStyle}
                    />

                    <button
                        type="button"
                        onClick={handleRename}
                        disabled={isSubmitting || !renameValue.trim()}
                        style={{
                            border: 'none',
                            background: renameValue.trim() ? '#6366f1' : '#334155',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: renameValue.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}