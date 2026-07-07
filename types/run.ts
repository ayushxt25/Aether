import { UIPlan } from './plan';

export interface PromptRun {
    id: number;
    versionId: number;
    versionNo: number;
    projectId: number;
    projectName: string;
    prompt: string;
    source: string;
    plan: UIPlan;
    code: string;
    explanation: string;
    timestamp: string;
}