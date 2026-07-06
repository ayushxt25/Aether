export function extractJsonFromLLMResponse(response: string): string {
    const trimmed = response.trim();

    const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedJsonMatch?.[1]) {
        return fencedJsonMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1).trim();
    }

    return trimmed;
}