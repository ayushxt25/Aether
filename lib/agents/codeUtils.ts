export function extractGeneratedComponentCode(raw: string): string {
    let text = raw.trim();

    const fencedMatch = text.match(/```(?:tsx|ts|jsx|js|javascript|typescript)?\s*([\s\S]*?)```/i);

    if (fencedMatch?.[1]) {
        text = fencedMatch[1].trim();
    }

    const arrowIndex = text.indexOf('() =>');

    if (arrowIndex >= 0) {
        text = text.slice(arrowIndex).trim();
    }

    text = text
        .replace(/^```[a-zA-Z]*\s*/g, '')
        .replace(/```$/g, '')
        .trim();

    if (!text.startsWith('() =>')) {
        return `
() => {
  return (
    <Card title="Generation Error">
      <p>The AI returned explanation text instead of executable preview code. Please try again with a simpler UI prompt.</p>
    </Card>
  );
}
`.trim();
    }

    return text;
}

export function looksLikeMarkdownInsteadOfCode(code: string): boolean {
    const trimmed = code.trim();

    if (!trimmed.startsWith('() =>')) {
        return true;
    }

    return (
        trimmed.startsWith('#') ||
        trimmed.startsWith('##') ||
        trimmed.startsWith('Here') ||
        trimmed.startsWith('This') ||
        trimmed.includes('```') ||
        trimmed.includes('Layout Architecture') ||
        trimmed.includes('Design Explanation')
    );
}