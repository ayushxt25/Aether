import { looksLikeMarkdownInsteadOfCode } from '@/lib/agents/codeUtils';
import { COMPONENT_WHITELIST } from './componentWhitelist';

export function validateGeneratedCode(code: string): { success: boolean; error?: string } {
    const trimmedCode = code.trim();

    if (looksLikeMarkdownInsteadOfCode(trimmedCode)) {
        return {
            success: false,
            error: 'Generated output is markdown/explanation text, not executable React component code.',
        };
    }

    if (trimmedCode.includes('import ')) {
        return {
            success: false,
            error: 'Generated code must not contain import statements because preview components are provided through react-live scope.',
        };
    }

    if (trimmedCode.includes('export default')) {
        return {
            success: false,
            error: 'Generated code must not contain export default. It must return only an arrow function component.',
        };
    }

    if (!trimmedCode.startsWith('() =>')) {
        return {
            success: false,
            error: 'Generated code must start with () => for react-live preview.',
        };
    }

    if (trimmedCode.includes('className=') || trimmedCode.includes('.css') || trimmedCode.includes('styled-components')) {
        if (trimmedCode.match(/className=["'][^"']*["']/)) {
            return {
                success: false,
                error: 'Tailwind or CSS classes are prohibited. Use inline style objects only.',
            };
        }
    }

    const jsxTags = trimmedCode.match(/<([A-Z][a-zA-Z0-9]*)/g);

    if (jsxTags) {
        for (const tagMatch of jsxTags) {
            const tag = tagMatch.substring(1);

            if (!COMPONENT_WHITELIST.includes(tag) && tag !== 'React' && tag !== 'Fragment') {
                return {
                    success: false,
                    error: `Unauthorized component usage: ${tag}`,
                };
            }
        }
    }

    if (trimmedCode.match(/\binterface\s+[A-Za-z0-9_]+\s*\{/)) {
        return {
            success: false,
            error: "TypeScript 'interface' detected. React-Live requires pure JavaScript.",
        };
    }

    if (trimmedCode.match(/\btype\s+[A-Za-z0-9_]+\s*=/)) {
        return {
            success: false,
            error: "TypeScript 'type' definition detected. Pure JS only.",
        };
    }

    if (trimmedCode.match(/\bexport\s+(default|const|let|var|function|class)\b/)) {
        return {
            success: false,
            error: "'export' statement detected. Return only the inline function.",
        };
    }

    return {
        success: true,
    };
}