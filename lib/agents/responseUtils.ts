export function extractJsonFromLLMResponse(response: string): string {
  const trimmed = response.trim();

  const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedJsonMatch?.[1]) {
    return extractBalancedJsonObject(fencedJsonMatch[1].trim());
  }

  return extractBalancedJsonObject(trimmed);
}

export function parseJsonFromLLMResponse(response: string): unknown {
  const extracted = extractJsonFromLLMResponse(response);

  try {
    return JSON.parse(extracted);
  } catch {
    const repaired = repairCommonJsonIssues(extracted);
    return JSON.parse(repaired);
  }
}

function extractBalancedJsonObject(text: string): string {
  const firstBrace = text.indexOf('{');

  if (firstBrace === -1) {
    return text.trim();
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth++;
    }

    if (char === '}') {
      depth--;

      if (depth === 0) {
        return text.slice(firstBrace, i + 1).trim();
      }
    }
  }

  const lastBrace = text.lastIndexOf('}');

  if (lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.slice(firstBrace).trim();
}

function repairCommonJsonIssues(json: string): string {
  return json
    .replace(/^\uFEFF/, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();
}