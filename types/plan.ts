import { z } from 'zod';
import { UIPlanSchema, UIComponentSchema } from '../lib/validation/planValidator';

export type UIComponent = z.infer<typeof UIComponentSchema>;

export type UIPlan = z.infer<typeof UIPlanSchema> & { hash?: string };

export interface Version {
    id: number;
    versionNo?: number;
    prompt?: string;
    source?: string;
    plan: UIPlan;
    code: string;
    explanation: string;
    timestamp: string;
}
