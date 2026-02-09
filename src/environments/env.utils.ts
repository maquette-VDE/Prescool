export const getApiBaseUrl = (fallback: string): string => {
  const runtimeBase =
    typeof window !== 'undefined' ? (window as any).__env?.API_BASE_URL : undefined;

  const base =
    typeof runtimeBase === 'string' && runtimeBase.trim().length > 0
      ? runtimeBase.trim()
      : fallback;

  return `${base.replace(/\/+$/, '')}/api/v1/`;
};
