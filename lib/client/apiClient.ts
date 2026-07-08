export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');

    throw new Error(
      text.includes('<!DOCTYPE')
        ? 'Server returned an HTML error page instead of JSON. Check database connection, environment variables, or server logs.'
        : text || 'Server returned an invalid response.'
    );
  }

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.error?.message ||
      result?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return result;
}